import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/lifecycle";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/auth/invite/confirm (public, one-time token required)
 *
 * The owner side of provisioning: the activation link from the invite
 * email carries a raw token; this endpoint exchanges it for a live
 * account. The token is checked as a SHA-256 digest with kind INVITE,
 * unexpired, and consumed inside the same transaction that stores the
 * new password, stamps activatedAt and bumps tokenVersion (so any
 * session minted before activation is dead).
 *
 * Failure answers are generic: bad token, spent token and expired
 * token all read the same, so nothing about the token's state leaks.
 *
 * Contract:
 *   200 { ok: true, clientId }
 *     | 400 { error } (bad/spent/expired token, weak password)
 *     | 429 { error } throttled | 500 { error }
 */

const confirmSchema = z.object({
  token: z.string().min(32).max(200),
  password: z.string().min(8, "That password is too short").max(200),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit("invite-confirm", ip, 10, 10 * 60 * 1000);
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
      select: {
        id: true,
        userId: true,
        kind: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    const valid =
      record &&
      record.kind === "INVITE" &&
      !record.usedAt &&
      record.expiresAt.getTime() > Date.now();

    if (!valid) {
      void recordAuditRaw({
        actorEmail: `ip:${ip}`,
        actorRole: "ANONYMOUS",
        action: "lifecycle.invite_invalid",
        targetType: "INVITE_TOKEN",
        targetLabel: "invalid_or_spent",
      });
      return NextResponse.json(
        { error: "This invite link is not valid anymore. Ask ORBYT for a fresh one." },
        { status: 400 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      // Single-use: claim the token first; a concurrent claim loses.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) {
        return null;
      }
      const user = await tx.user.update({
        where: { id: record.userId },
        data: {
          passwordHash: hashPassword(password),
          activatedAt: new Date(),
          tokenVersion: { increment: 1 },
          lastLoginAt: null,
        },
        select: { clientId: true, organizationId: true },
      });
      return user;
    });

    if (!result) {
      return NextResponse.json(
        { error: "This invite link is not valid anymore. Ask ORBYT for a fresh one." },
        { status: 400 },
      );
    }

    void recordAuditRaw({
      actorEmail: `user:${result.clientId ?? record.userId}`,
      actorRole: "CLIENT_OWNER",
      action: "lifecycle.invite_accepted",
      targetType: "USER",
      targetLabel: record.userId,
      metadata: { organizationId: result.organizationId ?? "" },
    });

    return NextResponse.json({ ok: true, clientId: result.clientId });
  } catch (error) {
    console.error("[auth/invite/confirm] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
