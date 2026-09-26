import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/password";
import { sendPasswordChangedEmail } from "@/lib/email";
import { recordAuditRaw } from "@/lib/portal/records";
import { formatDateTime } from "@/lib/portal/domain";

/**
 * POST /api/auth/password-reset/confirm (public)
 *
 * Step two of self-service password recovery: the one-time token from
 * the email plus the new password. The token is checked as a SHA-256
 * digest, must be unspent and inside its 30 minute window, and is
 * spent inside the same transaction that stores the new password and
 * bumps tokenVersion, which signs out every existing session.
 *
 * MFA stays untouched on purpose: an authenticator keeps protecting
 * the account even if the mailbox was the compromised side.
 *
 * Contract: 200 { ok: true } | 400 (bad or spent token, weak password)
 *           | 429 | 500.
 */

const confirmSchema = z.object({
  token: z.string().min(32).max(200),
  password: z.string().min(8, "That password is too short").max(200),
});

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  // Token guesses are hopeless (256-bit), the throttle is belt and braces.
  const limit = checkRateLimit("reset-confirm", ip, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { token, password } = parsed.data;

  try {
    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true } } },
    });

    const dead =
      !record ||
      record.usedAt !== null ||
      record.expiresAt.getTime() <= Date.now() ||
      !record.user;
    if (dead) {
      return NextResponse.json(
        { error: "This link has expired or was already used. Ask for a fresh one." },
        { status: 400 },
      );
    }

    const when = formatDateTime(new Date());
    await db.$transaction([
      db.user.update({
        where: { id: record.user.id },
        data: {
          passwordHash: hashPassword(password),
          tokenVersion: { increment: 1 },
        },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    sendPasswordChangedEmail(record.user.email, when);
    await recordAuditRaw({
      actorEmail: record.user.email,
      action: "auth.password_reset_completed",
      targetType: "ACCOUNT",
      targetLabel: record.user.email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[password-reset] confirm failed:", error);
    return NextResponse.json(
      { error: "That didn't go through. Try again in a minute." },
      { status: 500 },
    );
  }
}
