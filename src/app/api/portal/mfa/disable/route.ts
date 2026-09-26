import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/password";
import { requireMfaManager } from "@/lib/portal/security";
import { recordAudit } from "@/lib/portal/records";
import { sendMfaDisabledEmail } from "@/lib/email";

/**
 * POST /api/portal/mfa/disable (protected, owner seat, demo blocked)
 *
 * Turn two-step verification off. The password is required even
 * though the caller holds a live session: a hijacked tab must not be
 * able to quietly strip the second factor. The token version is
 * bumped, which signs out every session including this one; the
 * settings UI signs the caller out cleanly right after.
 * Contract: 200 { ok: true } | 400 | 401 | 403 | 429 | 500.
 */

const disableSchema = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    requireMfaManager(context);

    const limit = checkRateLimit(
      "mfa-disable",
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

    const input = await readJson(request, disableSchema);

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { passwordHash: true, mfaEnabledAt: true, mfaPendingSecret: true },
    });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "That password doesn't match." }, { status: 400 });
    }
    if (!user.mfaEnabledAt && !user.mfaPendingSecret) {
      return NextResponse.json(
        { error: "Two-step verification is already off." },
        { status: 400 },
      );
    }
    if (!verifyPassword(input.password, user.passwordHash)) {
      await recordAudit(context, {
        action: "account.mfa_disable_failed",
        targetType: "ACCOUNT",
        targetLabel: context.email,
      });
      return NextResponse.json({ error: "That password doesn't match." }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: context.userId },
        data: {
          mfaSecret: null,
          mfaPendingSecret: null,
          mfaEnabledAt: null,
          tokenVersion: { increment: 1 },
        },
      }),
      db.mfaBackupCode.deleteMany({ where: { userId: context.userId } }),
    ]);

    await recordAudit(context, {
      action: "account.mfa_disabled",
      targetType: "ACCOUNT",
      targetLabel: context.email,
    });
    sendMfaDisabledEmail(context.email);

    return NextResponse.json({ ok: true });
  }, { write: true });
}
