import { createHash, createHmac, randomBytes } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { PutObjectInput, StorageProvider } from "../provider";

/**
 * Local filesystem provider: the development / single-node default.
 * Objects live under db/storage (next to the SQLite file, excluded
 * from source control). Keys are flattened to safe file names; the
 * mapping is deterministic and collision-resistant via sha256 of the
 * key, with the original name kept as a suffix for humans.
 */

const ROOT = resolve(process.cwd(), "db", "storage");

function pathForKey(key: string): string {
  const digest = createHash("sha256").update(key).digest("hex").slice(0, 32);
  const safeSuffix = key.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return join(ROOT, digest, safeSuffix);
}

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  async put({ key, body }: PutObjectInput): Promise<void> {
    const path = pathForKey(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async delete(key: string): Promise<void> {
    await unlink(pathForKey(key)).catch(() => undefined);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(pathForKey(key));
      return true;
    } catch {
      return false;
    }
  }

  async download(key: string): Promise<Buffer> {
    return readFile(pathForKey(key));
  }

  /**
   * The local provider has no presigning concept: downloads always go
   * through the authorized route, which streams from this provider.
   * The URL builder below is used by the route for its own expiring
   * token form when needed; signedUrl stays null by contract.
   */
  async signedUrl(): Promise<string | null> {
    return null;
  }
}

/** HMAC token for the download route's own short-lived grants. */
export function localDownloadToken(key: string, ttlSeconds: number): string {
  const expires = Date.now() + ttlSeconds * 1000;
  const nonce = randomBytes(8).toString("hex");
  const secret = process.env.NEXTAUTH_SECRET ?? "orbyt-dev-secret-box";
  const signature = createHmac("sha256", secret)
    .update(`${key}:${expires}:${nonce}`)
    .digest("hex");
  return `${expires}.${nonce}.${signature}`;
}

export function verifyLocalDownloadToken(token: string, key: string): boolean {
  const [expiresRaw, nonce, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || !nonce || !signature) return false;
  if (Date.now() > expires) return false;
  const secret = process.env.NEXTAUTH_SECRET ?? "orbyt-dev-secret-box";
  const expected = createHmac("sha256", secret)
    .update(`${key}:${expires}:${nonce}`)
    .digest("hex");
  return signature.length === expected.length && signature === expected;
}
