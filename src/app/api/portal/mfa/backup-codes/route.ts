import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/password";
import { generateBackupCodes } from "@/lib/totp";
import { requireMfaManager } from "@/lib/portal/security";
import { recordAudit } from "@/lib/portal/records";

/**
 * POST /api/portal/mfa/backup-codes (protected, owner seat, demo blocked)
 *
 * Replace the batch of MFA recovery codes. The password confirms the
 * human is present; the old batch dies with the new one inside one
 * transaction, and the fresh codes are returned exactly once.
 * Contract: 200 { backupCodes } | 400 | 401 | 403 | 429 | 500.
 */

const regenerateSchema = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    requireMfaManager(context);

    const limit = checkRateLimit(
      "mfa-backup",
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

    const input = await readJson(request, regenerateSchema);

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { passwordHash: true, mfaEnabledAt: true },
    });
    if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      return NextResponse.json({ error: "That password doesn't match." }, { status: 400 });
    }
    if (!user.mfaEnabledAt) {
      return NextResponse.json(
        { error: "Turn two-step verification on first." },
        { status: 400 },
      );
    }

    const backupCodes = generateBackupCodes();
    await db.$transaction([
      db.mfaBackupCode.deleteMany({ where: { userId: context.userId } }),
      ...backupCodes.hashes.map((codeHash) =>
        db.mfaBackupCode.create({ data: { userId: context.userId, codeHash } }),
      ),
    ]);

    await recordAudit(context, {
      action: "account.mfa_backup_codes_regenerated",
      targetType: "ACCOUNT",
      targetLabel: context.email,
      metadata: { count: backupCodes.plain.length },
    });

    return NextResponse.json({ backupCodes: backupCodes.plain });
  }, { write: true });
}
