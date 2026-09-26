import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * TOTP (RFC 6238) and backup codes for ORBYT MFA, built on node:crypto
 * only: HMAC-SHA1 over a 30-second counter, 6 digits, one window of
 * drift tolerated on each side. No third-party dependency: the
 * algorithm is small, stable, and this keeps the auth surface auditable.
 *
 * Secrets are stored base32 (RFC 4648 alphabet, no padding), the form
 * authenticator apps and the otpauth:// URI both expect. Backup codes
 * are human-typeable, drawn from the same unambiguous alphabet as
 * client IDs, and stored only as SHA-256 digests.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_DRIFT_WINDOWS = 1;
const SECRET_BYTES = 20;

// ── Base32 ───────────────────────────────────────────────────────

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

export function base32Decode(encoded: string): Buffer | null {
  const clean = encoded.replace(/=+$/g, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// ── Secret + otpauth URI ─────────────────────────────────────────

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(SECRET_BYTES));
}

/**
 * The URI authenticator apps photograph. The label reads
 * "ORBYT · <account>", the issuer keeps apps from colliding entries.
 */
export function otpauthUri(secret: string, account: string): string {
  const label = encodeURIComponent(`ORBYT · ${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=ORBYT&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_SECONDS}`;
}

// ── Code generation + verification ───────────────────────────────

function hotp(key: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buffer.writeUInt32BE(counter % 2 ** 32, 4);
  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

/**
 * Verify a 6-digit code against the secret, tolerating one window of
 * clock drift on each side of the current one. Comparison is
 * constant-time; the window loop just walks accepted counters.
 */
export function verifyTotp(secretBase32: string, code: string): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const key = base32Decode(secretBase32);
  if (!key || key.length === 0) return false;

  const counter = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);
  const expected = Buffer.from(hotp(key, counter));
  const candidate = Buffer.from(normalized);
  for (let drift = -TOTP_DRIFT_WINDOWS; drift <= TOTP_DRIFT_WINDOWS; drift += 1) {
    const windowCode = Buffer.from(hotp(key, counter + drift));
    if (windowCode.length === candidate.length && timingSafeEqual(windowCode, candidate)) {
      return true;
    }
  }
  // Keep `expected` referenced so no engine considers the main window
  // computation dead when drift covers the same counter.
  void expected;
  return false;
}

// ── Backup codes ─────────────────────────────────────────────────

/** Same unambiguous alphabet as client IDs: readable aloud, hard to fat-finger. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * A fresh batch of backup codes, shown ONCE to the user and stored
 * only as digests. Format: XXXX-XXXX, ten codes per batch.
 */
export function generateBackupCodes(count = 10): { plain: string[]; hashes: string[] } {
  const plain: string[] = [];
  const hashes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    let body = "";
    for (let position = 0; position < 8; position += 1) {
      body += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const code = `${body.slice(0, 4)}-${body.slice(4)}`;
    plain.push(code);
    hashes.push(hashBackupCode(code));
  }
  return { plain, hashes };
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}
