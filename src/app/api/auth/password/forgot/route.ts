import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newResetToken } from "@/lib/mfa";
import { emailLinks, sendTemplate } from "@/lib/email";
import { isRateLimited, requestIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";

/**
 * POST /api/auth/password/forgot (public, hard rate limited)
 *
 * Request a password reset. The response is ALWAYS the same generic
 * body, whether or not the email belongs to an account: no
 * enumeration through this endpoint, ever.
 *
 * When the account exists: a single-use token (stored hashed, 30
 * minute expiry) plus an email with the reset link, plus a
 * PasswordResetAudit row and an append-only audit entry.
 *
 * Contract: 200 { ok: true } always | 400 | 429 | 500.
 */

const schema = z.object({
  email: z.string().trim().email().max(200).toLowerCase(),
});

const GENERIC = { ok: true as const };

export async function POST(request: Request) {
  if (isRateLimited("passwordReset", requestIp(request))) {
    // Same body as success: even the rate limit must not leak
    // whether the account exists.
    return NextResponse.json(GENERIC);
  }

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await request.json());
  } catch {
    return NextResponse.json(GENERIC);
  }

  try {
    const user = await db.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        notificationPrefsJson: true,
      },
    });

    if (user) {
      const { raw, hash } = newResetToken();
      const minutesValid = 30;
      await db.$transaction([
        db.authToken.create({
          data: {
            kind: "PASSWORD_RESET",
            userId: user.id,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + minutesValid * 60 * 1000),
          },
        }),
        db.passwordResetAudit.create({ data: { userId: user.id } }),
      ]);

      // Security email: sent regardless of notification preferences.
      // (Only the delivery channel is skipped in dev: the console
      // provider never leaves the machine.)
      await sendTemplate(
        {
          to: user.email,
          toName: user.name ?? "",
          organizationId: user.organizationId,
        },
        {
          key: "PASSWORD_RESET",
          name: user.name ?? "there",
          resetUrl: emailLinks.resetPassword(raw),
          minutesValid,
        },
      );

      await db.auditLog.create({
        data: {
          actorEmail: user.email,
          actorRole: user.role === "ADMIN" ? "ADMIN" : "CLIENT",
          action: "account.password_reset_requested",
          targetType: "ACCOUNT",
          targetLabel: user.email,
          metadataJson: "{}",
        },
      });

      logEvent("auth", "password_reset_requested", { userId: user.id });
    } else {
      logEvent("auth", "password_reset_unknown_email", {});
    }
  } catch (error) {
    console.error("[password-forgot] error:", error);
    // Even an internal error keeps the generic contract.
  }

  return NextResponse.json(GENERIC);
}
