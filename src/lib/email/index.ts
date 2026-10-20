import { db } from "@/lib/db";
import {
  inviteEmail,
  leadReceivedEmail,
  mfaDisabledEmail,
  mfaEnabledEmail,
  passwordChangedEmail,
  passwordResetEmail,
  type RenderedEmail,
} from "./templates";

/**
 * The ORBYT EmailService.
 *
 * Provider-agnostic by contract: the caller hands over a rendered
 * email, this module records it (EmailMessage row, status QUEUED),
 * dispatches to whichever provider the environment names, and moves
 * the row to SENT or FAILED. Delivery state is always a stored fact.
 *
 * Providers:
 *   console (default) : logs the email to the server log and marks it
 *                       SENT. Dev and sandbox runs: nothing leaves the
 *                       machine, and the log line carries the full body
 *                       so flows like password reset stay testable.
 *   resend            : POSTs to the Resend API. Requires RESEND_API_KEY.
 *
 * Failure contract: a failed send NEVER breaks the caller. Dispatch
 * runs in the background; the queued row is the audit trail. Callers
 * that want the row id can await sendEmail; everything else uses
 * sendEmailInBackground and never waits.
 *
 * Demo safety: the demo tenants run under the console provider and the
 * seeder never calls this module, so provisioning demo data can never
 * send a real email.
 */

const FROM_DEFAULT = "ORBYT <no-reply@orbyt.com>";

export type EmailInput = {
  to: string;
  rendered: RenderedEmail;
  /** Template identifier for the ledger, e.g. "auth.password_reset". */
  template?: string;
};

export type EmailSendResult = { id: string | null };

type Provider = "console" | "resend";

function activeProvider(): Provider {
  const raw = (process.env.EMAIL_PROVIDER ?? "").trim().toLowerCase();
  if (raw === "resend") return "resend";
  return "console";
}

/** Absolute base URL for links inside emails. */
export function appBaseUrl(): string {
  const url =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

async function dispatchConsole(input: EmailInput, rowId: string): Promise<void> {
  // The dev provider: everything shows in the server log (dev.log).
  console.log(
    [
      `[email:console] QUEUED->SENT id=${rowId} template=${input.template ?? "custom"}`,
      `  to: ${input.to}`,
      `  subject: ${input.rendered.subject}`,
      `  body(text): ${input.rendered.text.replace(/\n/g, " | ")}`,
    ].join("\n"),
  );
  await db.emailMessage.update({
    where: { id: rowId },
    data: { status: "SENT", provider: "console", sentAt: new Date() },
  });
}

async function dispatchResend(input: EmailInput, rowId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) throw new Error("RESEND_API_KEY missing");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? FROM_DEFAULT,
      to: [input.to],
      subject: input.rendered.subject,
      text: input.rendered.text,
      html: typeof input.rendered.html === "string" ? input.rendered.html : undefined,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 200)}`);
  }
  await db.emailMessage.update({
    where: { id: rowId },
    data: { status: "SENT", provider: "resend", sentAt: new Date() },
  });
}

/**
 * Record the email and hand it to the provider in the background.
 * Resolves once the ledger row exists (fast, local write); the
 * provider dispatch continues on its own and can never throw here.
 */
export async function sendEmail(input: EmailInput): Promise<EmailSendResult> {
  let rowId: string | null = null;
  try {
    const row = await db.emailMessage.create({
      data: {
        toEmail: input.to,
        subject: input.rendered.subject,
        textBody: input.rendered.text,
        htmlBody: typeof input.rendered.html === "string" ? input.rendered.html : null,
        template: input.template ?? "",
        status: "QUEUED",
        provider: activeProvider(),
      },
      select: { id: true },
    });
    rowId = row.id;
  } catch (error) {
    // The ledger itself failed: still try to deliver, but never throw.
    console.error("[email] failed to record outbound email:", error);
  }

  void (async () => {
    try {
      if (rowId && activeProvider() === "resend") {
        await dispatchResend(input, rowId);
      } else if (rowId) {
        await dispatchConsole(input, rowId);
      }
    } catch (error) {
      console.error("[email] dispatch failed:", error);
      if (rowId) {
        try {
          await db.emailMessage.update({
            where: { id: rowId },
            data: {
              status: "FAILED",
              error: error instanceof Error ? error.message.slice(0, 300) : "unknown",
            },
          });
        } catch {
          console.error("[email] could not record the failure either");
        }
      }
    }
  })();

  return { id: rowId };
}

/** Fire-and-forget variant for hot paths that must not wait at all. */
export function sendEmailInBackground(input: EmailInput): void {
  void sendEmail(input).catch((error) => {
    console.error("[email] background send crashed:", error);
  });
}

// ── Named sends: the vocabulary the rest of the app uses ─────────

export function sendPasswordResetEmail(to: string, link: string, expiresMinutes: number): void {
  sendEmailInBackground({
    to,
    template: "auth.password_reset",
    rendered: passwordResetEmail({ link, expiresMinutes }),
  });
}

export function sendPasswordChangedEmail(to: string, when: string): void {
  sendEmailInBackground({
    to,
    template: "auth.password_changed",
    rendered: passwordChangedEmail({ when }),
  });
}

export function sendMfaEnabledEmail(to: string): void {
  sendEmailInBackground({ to, template: "auth.mfa_enabled", rendered: mfaEnabledEmail() });
}

export function sendMfaDisabledEmail(to: string): void {
  sendEmailInBackground({ to, template: "auth.mfa_disabled", rendered: mfaDisabledEmail() });
}

export function sendInviteEmail(input: {
  to: string;
  ownerName: string;
  companyName: string;
  clientId: string;
  activationUrl: string;
  expiresDays: number;
}): void {
  sendEmailInBackground({
    to: input.to,
    template: "lifecycle.invite",
    rendered: inviteEmail({
      ownerName: input.ownerName,
      companyName: input.companyName,
      clientId: input.clientId,
      activationUrl: input.activationUrl,
      expiresDays: input.expiresDays,
    }),
  });
}

export function sendLeadReceivedEmail(to: string, name: string): void {
  sendEmailInBackground({
    to,
    template: "lifecycle.lead_received",
    rendered: leadReceivedEmail({ name }),
  });
}

// ── Deep links + named templates for the auth flows ──────────────

/** Absolute links that appear inside transactional emails. */
export const emailLinks = {
  resetPassword: (rawToken: string): string =>
    `${appBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`,
};

type TemplateEnvelope = {
  to: string;
  toName?: string;
  organizationId?: string | null;
};

type TemplateBody =
  | { key: "PASSWORD_RESET"; name: string; resetUrl: string; minutesValid: number };

/**
 * One named-template entry point for the auth routes: the route
 * declares WHAT was decided (key + variables), this module owns HOW
 * it reaches the inbox. Fire-and-forget like every send here.
 */
export async function sendTemplate(
  envelope: TemplateEnvelope,
  template: TemplateBody,
): Promise<void> {
  switch (template.key) {
    case "PASSWORD_RESET":
      sendPasswordResetEmail(envelope.to, template.resetUrl, template.minutesValid);
      return;
  }
}
