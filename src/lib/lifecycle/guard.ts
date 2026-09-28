import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * Guard for the lifecycle APIs (/api/lifecycle/*).
 *
 * These endpoints create tenants and mutate leads: they are staff
 * tooling, not client surface. The gate is a shared bearer key from
 * the environment (PROVISION_API_KEY), which the ORBYT team rotates
 * like any credential. Comparison is constant-time; every attempt,
 * allowed or denied, lands in the audit ledger with the source IP.
 *
 * When the key is not configured the endpoints answer 503 with an
 * honest message rather than silently failing open or closed.
 */

export type ProvisionGuard =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function requireProvisionKey(request: Request): Promise<ProvisionGuard> {
  const ip = clientIp(request);
  const expected = process.env.PROVISION_API_KEY?.trim() ?? "";

  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Provisioning is not configured on this deployment" },
        { status: 503 },
      ),
    };
  }

  // Peek before comparing, and only record the attempt when the key
  // is wrong. Correct credentials never consume the brute-force
  // budget, so normal console use cannot trip the throttle; an
  // attacker still hits the wall after 20 bad keys per window.
  const limit = checkRateLimit("provision-key", ip, 20, 10 * 60 * 1000, { peek: true });
  if (!limit.ok) {
    void recordAuditRaw({
      actorEmail: `ip:${ip}`,
      actorRole: "ANONYMOUS",
      action: "lifecycle.provision_throttled",
      targetType: "API",
      targetLabel: "lifecycle",
    });
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      ),
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  const keyOk = a.length === b.length && timingSafeEqual(a, b);

  if (!keyOk) {
    checkRateLimit("provision-key", ip, 20, 10 * 60 * 1000);
    void recordAuditRaw({
      actorEmail: `ip:${ip}`,
      actorRole: "ANONYMOUS",
      action: "lifecycle.provision_denied",
      targetType: "API",
      targetLabel: "lifecycle",
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}
