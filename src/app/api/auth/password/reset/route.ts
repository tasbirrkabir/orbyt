import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { hashPassword } from "@/lib/password";
import { isRateLimited, requestIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";

/**
 * POST /api/auth/password/reset (public, rate limited)
 *
 * Complete a password reset: token (single use, 30 minute expiry,
 * stored hashed) + new password. On success the password is replaced,
 * tokenVersion is bumped (every existing session dies, including a
 * hijacker's), all of the account's outstanding reset tokens are
 * consumed, and the audit trail records the completion.
 *
 * Contract: 200 { ok: true } | 400 { error } (weak password) |
 * 410 { error } (unknown / expired / used token) | 429 | 500.
 */

const schema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(10).max(200),
});

export async function POST(request: Request) {
  if (isRateLimited("passwordResetComplete", requestIp(request))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "That link is not valid." }, { status: 400 });
  }

  const row = await db.authToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  // Unknown, expired or already-used tokens are the same failure.
  if (!row || row.kind !== "PASSWORD_RESET" || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is not valid anymore. Request a new one." },
      { status: 410 },
    );
  }

  const updated = await db.user.update({
    where: { id: row.userId },
    data: {
      passwordHash: hashPassword(input.password),
      tokenVersion: { increment: 1 },
    },
    select: { tokenVersion: true },
  });

  await db.$transaction([
    db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    // No other reset link for this account may survive a completed reset.
    db.authToken.updateMany({
      where: { userId: row.userId, kind: "PASSWORD_RESET", usedAt: null, NOT: { id: row.id } },
      data: { usedAt: new Date() },
    }),
    db.passwordResetAudit.updateMany({
      where: { userId: row.userId, completedAt: null },
      data: { completedAt: new Date(), actorKind: row.user.role === "ADMIN" ? "ADMIN" : "CLIENT" },
    }),
    db.auditLog.create({
      data: {
        actorEmail: row.user.email,
        actorRole: row.user.role === "ADMIN" ? "ADMIN" : "CLIENT",
        action: "account.password_reset_completed",
        targetType: "ACCOUNT",
        targetLabel: row.user.email,
        metadataJson: JSON.stringify({ tokenVersion: updated.tokenVersion }),
      },
    }),
  ]);

  logEvent("auth", "password_reset_completed", { userId: row.userId });
  return NextResponse.json({ ok: true });
}
