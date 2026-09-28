import { db } from "@/lib/db";
import {
  backupCodeHash,
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateTotpSecret,
  secureToken,
  hashToken,
  totpUri,
  verifyTotp,
} from "@/lib/security";

/**
 * The MFA service (TOTP-based, RFC 6238).
 *
 * Lifecycle:
 *   setup    -> a PENDING enrollment with a fresh encrypted secret
 *   verify   -> first correct code flips PENDING to ACTIVE, hands out
 *               single-use backup codes exactly once
 *   disable  -> password re-check + enrollment marked DISABLED
 *
 * Login challenge: accounts with ACTIVE MFA sign in in two steps.
 * Step one (password) issues a LOGIN_MFA AuthToken ticket, valid 5
 * minutes, single use, stored hashed. Step two exchanges the ticket
 * plus a code for the session. Everything here is server-side.
 */

export const MFA_TICKET_TTL_MS = 5 * 60 * 1000;
export const BACKUP_CODE_COUNT = 8;

/** Start (or restart) a PENDING enrollment for this user. */
export async function beginMfaEnrollment(
  userId: string,
  email: string,
): Promise<{ secret: string; uri: string }> {
  const secret = generateTotpSecret();
  const cipher = encryptSecret(secret);

  const existing = await db.mfaEnrollment.findUnique({ where: { userId } });
  if (existing) {
    await db.mfaEnrollment.update({
      where: { userId },
      data: {
        secretCipher: cipher,
        status: "PENDING",
        backupHashesJson: "[]",
        lastUsedCode: "",
        confirmedAt: null,
      },
    });
  } else {
    await db.mfaEnrollment.create({
      data: { userId, secretCipher: cipher, status: "PENDING" },
    });
  }

  return { secret, uri: totpUri(secret, email) };
}

/** Issue a short-lived login challenge ticket (raw, stored hashed). */
export async function createMfaLoginTicket(userId: string): Promise<string> {
  const raw = secureToken(24);
  await db.authToken.create({
    data: {
      kind: "LOGIN_MFA",
      userId,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + MFA_TICKET_TTL_MS),
    },
  });
  return raw;
}

/**
 * Exchange a login ticket for the user it belongs to. Single use and
 * expiring; a consumed or stale ticket answers null, which the caller
 * reports as a generic failure.
 */
export async function consumeMfaLoginTicket(raw: string): Promise<string | null> {
  const row = await db.authToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!row || row.kind !== "LOGIN_MFA" || row.usedAt || row.expiresAt < new Date()) {
    return null;
  }
  await db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row.userId;
}

/** Generate backup codes, store hashes, return the raw codes ONCE. */
export async function issueBackupCodes(userId: string): Promise<string[]> {
  const codes = generateBackupCodes(BACKUP_CODE_COUNT);
  const hashes = codes.map((code) => backupCodeHash(code));
  await db.mfaEnrollment.update({
    where: { userId },
    data: { backupHashesJson: JSON.stringify(hashes) },
  });
  return codes;
}

/**
 * Confirm a PENDING enrollment with its first code. Returns the raw
 * backup codes (shown once) or null when the code is wrong.
 */
export async function confirmMfaEnrollment(
  userId: string,
  code: string,
): Promise<{ backupCodes: string[] } | null> {
  const enrollment = await db.mfaEnrollment.findUnique({ where: { userId } });
  if (!enrollment || enrollment.status !== "PENDING") return null;

  let secret: string;
  try {
    secret = decryptSecret(enrollment.secretCipher);
  } catch {
    return null;
  }

  const verified = verifyTotp(secret, code, null);
  if (!verified.ok) return null;

  await db.mfaEnrollment.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      confirmedAt: new Date(),
      lastUsedCode: `step:${verified.step ?? 0}`,
    },
  });
  const backupCodes = await issueBackupCodes(userId);
  return { backupCodes };
}

/** Clean up expired tickets; called opportunistically from routes. */
export async function sweepExpiredAuthTokens(): Promise<void> {
  await db.authToken.deleteMany({ where: { expiresAt: new Date(Date.now()) } });
}

/** Cryptographically random password-reset token pair (raw + hash). */
export function newResetToken(): { raw: string; hash: string } {
  const raw = secureToken(32);
  return { raw, hash: hashToken(raw) };
}
