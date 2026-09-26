import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { hashPassword, verifyPassword } from "@/lib/password";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/portal/records";
import { sendPasswordChangedEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/portal/domain";

/**
 * POST /api/portal/password (protected, writers only)
 * Change the caller's own password. Requires the current one; the
 * response is generic so nothing about the account is revealed.
 * Viewer accounts cannot change credentials for the workspace.
 *
 * Hardened: throttled per IP and user, and the change bumps
 * tokenVersion inside the same write, which signs out every existing
 * session (this one included) and fires the change notification email.
 * Contract: 200 { ok: true } | 400 | 401 | 403 | 429 | 500.
 */

const changeSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  return portalRoute(
      async (context) => {
    const limit = checkRateLimit(
      "password-change",
      `${clientIp(request)}:${context.userId}`,
      5,
      10 * 60 * 1000,
    );
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const input = await readJson(request, changeSchema);

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !verifyPassword(input.current, user.passwordHash)) {
      return NextResponse.json(
        { error: "That current password doesn't match." },
        { status: 400 },
      );
    }

    const when = formatDateTime(new Date());
    await db.user.update({
      where: { id: context.userId },
      data: {
        passwordHash: hashPassword(input.next),
        tokenVersion: { increment: 1 },
      },
    });
    await recordAudit(context, {
      action: "account.password_change",
      targetType: "ACCOUNT",
      targetLabel: context.email,
    });
    sendPasswordChangedEmail(context.email, when);

    return NextResponse.json({ ok: true });
  }, { write: true });
}
