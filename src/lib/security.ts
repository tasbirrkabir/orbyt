import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

/**
 * Security primitives for the ORBYT platform. Everything here is
 * node:crypto only (no external deps) and server-side only.
 *
 * - secureToken / hashToken: single-use tokens (password reset, MFA
 *   login tickets). Tokens travel raw, rest as sha256 hashes.
 * - encryptSecret / decryptSecret: AES-256-GCM box for secrets that
 *   must be recoverable (TOTP shared secrets). Key from env, lazily
 *   derived with scrypt so a missing key never crashes the app in dev.
 * - TOTP (RFC 6238) + base32: MFA code generation and verification.
 * - constantTimeEqual: comparison helper for anything secret-shaped.
 */

/* ── Tokens ──────────────────────────────────────────────────── */

/** URL-safe random token, ~32 chars of entropy by default. */
export function secureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** sha256 hex of a raw token. This (never the raw token) is stored. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

/* ── Encryption at rest (AES-256-GCM) ────────────────────────── */

const MFA_KEY_SALT = "orbyt:secret-box:v1";

/** Cached derived key; derivation is scrypt and costs real time. */
let cachedKey: Buffer | null = null;

function secretBoxKey(): Buffer {
  if (cachedKey) return cachedKey;
  const source =
    process.env.SECRET_BOX_KEY ?? process.env.NEXTAUTH_SECRET ?? "orbyt-dev-secret-box";
  // scrypt stretches the key so a weak env value still takes work.
  cachedKey = scryptSync(source, MFA_KEY_SALT, 32);
  return cachedKey;
}

/** Encrypt a UTF-8 secret. Returns iv:tag:cipher, all hex. */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretBoxKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

/** Decrypt an encryptSecret payload. Throws on tamper (GCM tag). */
export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("malformed cipher");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    secretBoxKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

/* ── base32 (RFC 4648, no padding) ───────────────────────────── */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/* ── TOTP (RFC 6238, SHA-1, 6 digits, 30s step) ──────────────── */

export const TOTP_STEP_SECONDS = 30;
/** Codes from the previous, current and next step all verify. */
const TOTP_WINDOW = 1;

/** Generate a fresh TOTP shared secret, base32 encoded (160 bits). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** otpauth:// URI for authenticator apps. */
export function totpUri(secret: string, account: string, issuer = "ORBYT"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  const digest = createHmac("sha1", secret).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

/** Current 6-digit TOTP code (used for tests and debug tooling). */
export function totpNow(secretBase32: string, atMs = Date.now()): string {
  return hotp(base32Decode(secretBase32), Math.floor(atMs / 1000 / TOTP_STEP_SECONDS));
}

export type TotpVerify = {
  ok: boolean;
  /** Set when ok: which time step accepted, for replay guarding. */
  step?: number;
};

/**
 * Verify a 6-digit code against the secret, allowing the ±1 step
 * clock window. `lastStep` is the step that produced the most
 * recently ACCEPTED code; an exact replay is rejected.
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  lastStep: number | null,
  atMs = Date.now(),
): TotpVerify {
  const normalized = (code ?? "").replace(/\D/g, "");
  if (normalized.length !== 6) return { ok: false };
  const secret = base32Decode(secretBase32);
  const currentStep = Math.floor(atMs / 1000 / TOTP_STEP_SECONDS);
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift += 1) {
    const step = currentStep + drift;
    if (lastStep !== null && step <= lastStep) continue;
    const expected = hotp(secret, step);
    if (constantTimeEqual(normalized, expected)) return { ok: true, step };
  }
  return { ok: false };
}

/* ── Backup codes ────────────────────────────────────────────── */

const BACKUP_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** 8 single-use backup codes, XXXX-XXXX, human friendly alphabet. */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    let body = "";
    for (let position = 0; position < 8; position += 1) {
      body += BACKUP_ALPHABET[randomInt(BACKUP_ALPHABET.length)];
      if (position === 3) body += "-";
    }
    codes.push(body);
  }
  return codes;
}

export function backupCodeHash(code: string): string {
  return hashToken(code.trim().toUpperCase());
}

/* ── Constant-time compare ───────────────────────────────────── */

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Compare anyway to keep timing flat, then fail.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
