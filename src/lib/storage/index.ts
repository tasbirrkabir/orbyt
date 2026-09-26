import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * The ORBYT StorageService.
 *
 * Provider-agnostic by contract, mirroring the EmailService pattern:
 * callers hand over a validated object key and bytes, the active
 * provider stores them, and every returned fact (size, existence) is
 * real. Before this module the platform had zero upload code; the
 * file index (PortalFile) carried optional external links only.
 *
 * Keys are tenant-scoped paths like `org/<organizationId>/<fileId>`.
 * Validation is strict: lowercase alphanumeric with `/`, `-`, `_`,
 * no `..`, no leading slash, bounded length. A bad key is a caller
 * bug, so it throws instead of guessing an intent.
 *
 * Providers:
 *   local (default) : files under STORAGE_DIR (default <cwd>/storage),
 *                     written atomically (temp file + rename) so a
 *                     crash never leaves a half-written object.
 *   s3              : reserved for production. Selecting it without
 *                     the adapter wired throws a clear configuration
 *                     error; the interface below is the swap point.
 *
 * Every function is safe to call from route handlers; failures throw
 * with sanitized messages (never absolute paths) and the caller's
 * funnel decides what the client sees.
 */

export const MAX_OBJECT_BYTES = 25 * 1024 * 1024; // 25 MB, the honest cap for documents

export type StoragePutResult = {
  key: string;
  sizeBytes: number;
  provider: string;
};

const KEY_PATTERN = /^[a-z0-9][a-z0-9/_-]{0,199}$/;

/** Throws with a caller-facing message when the key is not safe. */
export function assertValidKey(key: string): string {
  if (typeof key !== "string" || !KEY_PATTERN.test(key) || key.includes("..")) {
    throw new Error("Invalid storage key");
  }
  return key;
}

type Provider = "local" | "s3";

function activeProvider(): Provider {
  const raw = (process.env.STORAGE_PROVIDER ?? "").trim().toLowerCase();
  if (raw === "s3") return "s3";
  return "local";
}

export function storageProviderName(): string {
  return activeProvider();
}

function localRoot(): string {
  const configured = process.env.STORAGE_DIR?.trim();
  return configured && configured.length > 0
    ? path.resolve(configured)
    : path.join(process.cwd(), "storage");
}

/** Absolute disk path for a validated key; callers must pre-validate. */
function localPath(key: string): string {
  return path.join(localRoot(), key);
}

async function putLocal(key: string, data: Uint8Array): Promise<number> {
  const target = localPath(key);
  await mkdir(path.dirname(target), { recursive: true });
  const temp = `${target}.${Date.now().toString(36)}.tmp`;
  await writeFile(temp, data);
  await rename(temp, target); // atomic on the same filesystem
  return data.byteLength;
}

// ── Public surface ────────────────────────────────────────────────

/** Store an object. Rejects oversize or malformed keys before any I/O. */
export async function putObject(
  key: string,
  data: Uint8Array,
  _contentType?: string,
): Promise<StoragePutResult> {
  assertValidKey(key);
  if (data.byteLength <= 0) throw new Error("Empty object");
  if (data.byteLength > MAX_OBJECT_BYTES) throw new Error("Object too large");
  if (activeProvider() === "s3") {
    throw new Error("S3 storage provider is not wired in this deployment; use local");
  }
  const sizeBytes = await putLocal(key, data);
  return { key, sizeBytes, provider: "local" };
}

/** Read an object back. Throws "Object not found" when absent. */
export async function getObject(key: string): Promise<Uint8Array> {
  assertValidKey(key);
  if (activeProvider() === "s3") {
    throw new Error("S3 storage provider is not wired in this deployment; use local");
  }
  try {
    return await readFile(localPath(key));
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "ENOENT") throw new Error("Object not found");
    throw error;
  }
}

/** Object metadata without reading the body. Null when absent. */
export async function objectInfo(
  key: string,
): Promise<{ sizeBytes: number } | null> {
  assertValidKey(key);
  try {
    const info = await stat(localPath(key));
    return info.isFile() ? { sizeBytes: info.size } : null;
  } catch {
    return null;
  }
}

/** Delete an object. Deleting a missing key is a no-op (idempotent). */
export async function deleteObject(key: string): Promise<void> {
  assertValidKey(key);
  await rm(localPath(key), { force: true, recursive: false });
}

/**
 * Health probe: a full roundtrip (put, get, verify bytes, delete) on a
 * throwaway probe object. Used by /api/healthz so the health report
 * reflects a real write path, not a directory listing.
 */
export async function storageProbe(): Promise<{
  ok: boolean;
  provider: string;
  detail: string;
}> {
  const provider = storageProviderName();
  try {
    if (provider === "s3") {
      return { ok: false, provider, detail: "s3 selected but adapter not wired" };
    }
    const key = `probe/probe-${Date.now().toString(36)}`;
    const payload = new TextEncoder().encode(`orbyt-probe-${Date.now()}`);
    await putObject(key, payload);
    const back = await getObject(key);
    await deleteObject(key);
    const ok = back.byteLength === payload.byteLength;
    return { ok, provider, detail: ok ? "roundtrip ok" : "roundtrip byte mismatch" };
  } catch (error) {
    return {
      ok: false,
      provider,
      detail: error instanceof Error ? error.message.slice(0, 120) : "probe failed",
    };
  }
}
