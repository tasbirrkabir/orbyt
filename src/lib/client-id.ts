/**
 * Client ID handling for the ORBYT portal.
 *
 * A client ID is the key to the portal. ORBYT issues one by email when a
 * service engagement starts; it is never self-served. Login requires the
 * ID to match the account, so a stolen password alone opens nothing.
 */

/** Unambiguous alphabet: no 0/O, no 1/I/L. Built for reading aloud and typing. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const BODY_LENGTH = 6

/**
 * Normalize whatever the visitor typed into the canonical stored form:
 * "orb demo", "orb-demo", " ORB-DEMO " all become "ORB-DEMO".
 */
export function normalizeClientId(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Fresh ID in the ORB-XXXXXX format, for provisioning new clients. */
export function generateClientId(): string {
  let body = ""
  for (let index = 0; index < BODY_LENGTH; index += 1) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return `ORB-${body}`
}
