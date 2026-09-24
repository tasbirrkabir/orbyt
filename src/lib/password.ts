import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Password hashing with node:crypto scrypt only (no external deps).
 * Stored format: `s2:<salt hex>:<hash hex>` (salt 16 bytes, derived key 64 bytes).
 * The version prefix ("s2") leaves room for future hash upgrades.
 */

const SALT_BYTES = 16
const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `s2:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  if (typeof stored !== 'string') return false

  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 's2') return false

  const [, salt, hash] = parts
  if (!salt || !hash) return false

  try {
    const expected = Buffer.from(hash, 'hex')
    const candidate = scryptSync(password, salt, KEY_LENGTH)

    // Length guard first: timingSafeEqual throws on length mismatch.
    if (candidate.length !== expected.length) return false

    return timingSafeEqual(candidate, expected)
  } catch {
    // Malformed stored string or bad inputs never crash the caller.
    return false
  }
}
