import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { generateBackupCodes, verifyTotp } from "@/lib/totp";
import { requireMfaManager } from "@/lib/portal/security";
import { recordAudit } from "@/lib/portal/records";
import { sendMfaEnabledEmail } from "@/lib/email";

/**
 * POST /api/portal/mfa/verify (protected, owner seat, demo blocked)
 *
 * Step two of enabling two-step verification: the caller proves the
 * authenticator app actually holds the pending secret by submitting a
 * live code. Success promotes the pending secret, stamps the enabled
 * date, issues one fresh batch of backup codes (returned exactly once)
 * and leaves an audit row plus a confirmation email.
 * Contract: 200 { backupCodes } | 400 | 401 | 403 | 429 | 500.
 */

const verifySchema = z.object({
  code: z.string().trim().min(6).max(20),
});

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    requireMfaManager(context);

    const limit = checkRateLimit(
      "mfa-verify",
      `${clientIp(request)}:${context.userId}`,
      8,
      10 * 60 * 1000,
    );
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const input = await readJson(request, verifySchema);

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { mfaPendingSecret: true, mfaEnabledAt: true },
    });
    if (!user?.mfaPendingSecret) {
      return NextResponse.json(
        { error: "Start the setup again: the pending setup has expired." },
        { status: 400 },
      );
    }
    if (user.mfaEnabledAt) {
      return NextResponse.json(
        { error: "Two-step verification is already on." },
        { status: 409 },
      );
    }

    if (!verifyTotp(user.mfaPendingSecret, input.code)) {
      return NextResponse.json(
        { error: "That code didn't match. Check the app and try the newest one." },
        { status: 400 },
      );
    }

    const backupCodes = generateBackupCodes();
    await db.$transaction([
      db.user.update({
        where: { id: context.userId },
        data: {
          mfaSecret: user.mfaPendingSecret,
          mfaPendingSecret: null,
          mfaEnabledAt: new Date(),
        },
      }),
      db.mfaBackupCode.deleteMany({ where: { userId: context.userId } }),
      ...backupCodes.hashes.map((codeHash) =>
        db.mfaBackupCode.create({ data: { userId: context.userId, codeHash } }),
      ),
    ]);

    await recordAudit(context, {
      action: "account.mfa_enabled",
      targetType: "ACCOUNT",
      targetLabel: context.email,
    });
    sendMfaEnabledEmail(context.email);

    return NextResponse.json({ backupCodes: backupCodes.plain });
  }, { write: true });
}
