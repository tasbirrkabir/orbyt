import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { normalizeClientId } from "@/lib/client-id";
import { decryptSecret, verifyTotp, backupCodeHash } from "@/lib/security";

/**
 * Shared credential verification for the two login surfaces (the
 * NextAuth authorize callback and the MFA challenge endpoint). One
 * implementation means one policy: generic failures, no enumeration,
 * MFA state considered, nothing logged.
 */

export type VerifiedUser = {
  id: string;
  email: string;
  name: string | null;
  tokenVersion: number;
  mfaActive: boolean;
};

export type CredentialInput = {
  clientId?: string | null;
  email?: string | null;
  password?: string | null;
};

/**
 * Verify email + password (+ client ID for portal seats). Returns the
 * user or null. NULL is deliberately the ONLY failure signal: the
 * caller never learns whether the email, the password or the ID was
 * wrong.
 */
export async function verifyCredentials(
  input: CredentialInput,
): Promise<VerifiedUser | null> {
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password) return null;

  const rawClientId =
    typeof input.clientId === "string" ? normalizeClientId(input.clientId) : "";

  let user;
  if (!rawClientId) {
    // ORBYT staff path: admins hold no client ID.
    user = await db.user.findFirst({
      where: { email, role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        tokenVersion: true,
        mfaEnrollment: { where: { status: "ACTIVE" }, select: { id: true } },
      },
    });
  } else {
    // Portal seat: the client ID names the engagement and must match
    // the organization or the legacy per-user key.
    user = await db.user.findFirst({
      where: {
        email,
        role: { not: "ADMIN" },
        OR: [{ organization: { clientId: rawClientId } }, { clientId: rawClientId }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        tokenVersion: true,
        mfaEnrollment: { where: { status: "ACTIVE" }, select: { id: true } },
      },
    });
  }

  if (!user?.passwordHash) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tokenVersion: user.tokenVersion,
    // One-to-one optional relation: the ACTIVE-filtered include yields
    // the row when a live enrollment exists, null otherwise. An array
    // length check here crashed every login without an enrollment row.
    mfaActive: user.mfaEnrollment !== null,
  };
}

/**
 * Verify a second factor against an ACTIVE enrollment: a 6-digit TOTP
 * code (30s step, ±1 window, replay-guarded) or a single-use backup
 * code. On success the enrollment's replay marker / backup hashes are
 * updated by the caller via the returned detail.
 */
export async function verifySecondFactor(
  userId: string,
  code: string,
  atMs = Date.now(),
): Promise<{ ok: boolean; via: "TOTP" | "BACKUP" | null }> {
  const trimmed = (code ?? "").trim();
  if (!trimmed) return { ok: false, via: null };

  const enrollment = await db.mfaEnrollment.findUnique({
    where: { userId },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    return { ok: false, via: null };
  }

  let secret: string;
  try {
    secret = decryptSecret(enrollment.secretCipher);
  } catch {
    return { ok: false, via: null };
  }

  // TOTP first. lastUsedCode stores "step:<n>" of the last accepted
  // code so the same code can never verify twice.
  let lastStep: number | null = null;
  if (enrollment.lastUsedCode.startsWith("step:")) {
    const parsed = Number(enrollment.lastUsedCode.slice(5));
    lastStep = Number.isFinite(parsed) ? parsed : null;
  }
  const totp = verifyTotp(secret, trimmed.replace(/\s/g, ""), lastStep, atMs);
  if (totp.ok && typeof totp.step === "number") {
    await db.mfaEnrollment.update({
      where: { userId },
      data: { lastUsedCode: `step:${totp.step}` },
    });
    return { ok: true, via: "TOTP" };
  }

  // Backup codes: single use, stored as sha256 hashes.
  const hash = backupCodeHash(trimmed);
  const hashes = safeHashes(enrollment.backupHashesJson);
  const index = hashes.indexOf(hash);
  if (index >= 0) {
    const remaining = hashes.filter((_, i) => i !== index);
    await db.mfaEnrollment.update({
      where: { userId },
      data: { backupHashesJson: JSON.stringify(remaining) },
    });
    return { ok: true, via: "BACKUP" };
  }

  return { ok: false, via: null };
}

function safeHashes(json: string): string[] {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}
