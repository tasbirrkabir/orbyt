import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { appBaseUrl, sendPasswordResetEmail } from "@/lib/email";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/auth/password-reset (public)
 *
 * Step one of self-service password recovery: ask for a reset link.
 * The response is always the same generic confirmation, whether or
 * not the address exists and has a password, so nobody can probe for
 * accounts. Real work only happens for a real, activated account:
 * a single-use token (SHA-256 hashed at rest, 30 minute expiry) and
 * an email carrying the one-time link.
 *
 * Rate limits: per IP and per mailbox, both generous enough for a
 * human and hostile to a script.
 * Contract: 200 { ok: true } always | 400 | 429 | 500.
 */

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
});

const TOKEN_TTL_MINUTES = 30;

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const ipLimit = checkRateLimit("reset-ip", ip, 5, 10 * 60 * 1000);
  if (!ipLimit.ok) {
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
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    // Same answer for a malformed email as for an unknown one.
    return NextResponse.json({ ok: true });
  }
  const { email } = parsed.data;

  const emailLimit = checkRateLimit("reset-email", email, 3, 60 * 60 * 1000);
  if (!emailLimit.ok) {
    return NextResponse.json({ ok: true });
  }

  try {
    const user = await db.user.findFirst({
      where: { email },
      select: { id: true, passwordHash: true, activatedAt: true },
    });

    if (user?.passwordHash) {
      const raw = randomBytes(32).toString("hex");
      await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
          requestIp: ip,
        },
      });

      const link = `${appBaseUrl()}/login/reset?token=${raw}`;
      sendPasswordResetEmail(email, link, TOKEN_TTL_MINUTES);

      await recordAuditRaw({
        actorEmail: email,
        action: "auth.password_reset_requested",
        targetType: "ACCOUNT",
        targetLabel: email,
        metadata: { ttlMinutes: TOKEN_TTL_MINUTES },
      });
    } else {
      // Unknown or never-activated mailbox: identical reply, one audit
      // row so the ops side can see probing without exposing anything.
      await recordAuditRaw({
        actorEmail: email,
        action: "auth.password_reset_unknown",
        targetType: "ACCOUNT",
        targetLabel: email,
      });
    }
  } catch (error) {
    console.error("[password-reset] request failed:", error);
    // Even an internal error answers the same generic confirmation.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
