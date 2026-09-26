import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storageProbe, storageProviderName } from "@/lib/storage";
import { log } from "@/lib/observability";

/**
 * GET /api/healthz
 *
 * The platform health report, built exclusively from recorded facts:
 *   - db: a real `SELECT 1` roundtrip with measured latency
 *   - storage: a real put/get/delete roundtrip on a throwaway probe
 *   - email: the configured provider name plus outbox ledger counts
 *
 * No PII, no credentials, no user counts. HTTP 200 when the core
 * (database) is healthy, 503 when it is not; storage or a backed-up
 * email outbox degrade the body but never block the response. Load
 * balancers and uptime monitors read `status`; humans read `checks`.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  // Database: the only check that decides overall status.
  let dbOk = false;
  let dbLatencyMs = -1;
  let dbError = "";
  try {
    const t0 = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message.slice(0, 160) : "unknown";
  }

  // Storage: real roundtrip, but never blocks the report for long.
  const storage = await storageProbe();

  // Email: provider name + outbox ledger counts (stored facts).
  const provider = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  let outbox = { queued: -1, sent: -1, failed: -1 };
  try {
    const [queued, sent, failed] = await Promise.all([
      db.emailMessage.count({ where: { status: "QUEUED" } }),
      db.emailMessage.count({ where: { status: "SENT" } }),
      db.emailMessage.count({ where: { status: "FAILED" } }),
    ]);
    outbox = { queued, sent, failed };
  } catch {
    // Counts unavailable: reported as -1, never fabricated.
  }

  const status = dbOk ? "ok" : "degraded";
  const httpStatus = dbOk ? 200 : 503;

  log[dbOk ? "info" : "error"]("healthz", status === "ok" ? "health check ok" : "health check degraded", {
    db: dbOk,
    dbMs: dbLatencyMs,
    storage: storage.ok,
    ms: Date.now() - startedAt,
  });

  return NextResponse.json(
    {
      status,
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        db: { ok: dbOk, latencyMs: dbLatencyMs, ...(dbError ? { error: dbError } : {}) },
        storage: { ok: storage.ok, provider: storageProviderName(), detail: storage.detail },
        email: { provider, outbox },
      },
    },
    { status: httpStatus },
  );
}
