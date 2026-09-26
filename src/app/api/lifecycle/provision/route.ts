import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { provisionTenant } from "@/lib/lifecycle";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/lifecycle/provision (staff key required)
 *
 * Direct tenant provisioning: creates the organization, owner account,
 * optional first project, welcome activity and a single-use invitation
 * token, then emails the activation link. This is the LEAD -> CLIENT ->
 * ORGANIZATION -> CLIENT ID -> ONBOARDING door for engagements that do
 * not start from a website lead.
 *
 * Contract:
 *   201 { ok, organizationId, clientId, ownerUserId, projectId, activationUrl, inviteExpiresAt }
 *   400 invalid input | 401 bad key | 409 email taken
 *   429 throttled | 500 | 503 provisioning not configured
 */
const bodySchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  ownerEmail: z.string().trim().toLowerCase().email().max(200),
  ownerName: z.string().trim().min(2).max(120),
  tier: z.enum(["WEBSITE_ONLY", "MARKETING_WEBSITE", "FULL_SERVICE"]),
  country: z.string().trim().max(80).optional(),
  projectTitle: z.string().trim().max(200).optional(),
  projectType: z
    .enum(["WEBSITE", "MARKETING", "AUTOMATION", "AI", "FULL_SERVICE"])
    .optional(),
});

export async function POST(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const result = await provisionTenant(parsed.data);
    void recordAuditRaw({
      actorEmail: `ip:${clientIpForAudit(request)}`,
      actorRole: "STAFF",
      action: "lifecycle.provision",
      targetType: "ORGANIZATION",
      targetLabel: parsed.data.companyName,
      metadata: { clientId: result.clientId, leadId: null },
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (typeof status === "number") {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Error" },
        { status },
      );
    }
    console.error("[lifecycle/provision] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function clientIpForAudit(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
