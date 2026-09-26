import { NextResponse } from "next/server";
import { z } from "zod";
import { routeId } from "@/lib/portal/api";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { convertLead, setLeadStatus } from "@/lib/lifecycle";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/lifecycle/leads/[id] (staff key required)
 *
 * The two lead mutations, chosen by `action`:
 *   { action: "status",  status: "CONTACTED" | "QUALIFIED" | "NEW" | "ARCHIVED" }
 *   { action: "convert", tier: "WEBSITE_ONLY" | "MARKETING_WEBSITE" | "FULL_SERVICE",
 *                          companyName?, ownerEmail?, ownerName?,
 *                          projectTitle?, projectType? }
 *
 * Conversion provisions the whole tenant and marks the lead CONVERTED
 * in one transaction; the response carries the client ID and the
 * one-time activation link (also emailed).
 *
 * Contract: 200/201 { ok, ... } | 400 | 401 | 404 | 409 | 429 | 503.
 */

const statusSchema = z.object({
  action: z.literal("status"),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "ARCHIVED"]),
});

const convertSchema = z.object({
  action: z.literal("convert"),
  tier: z.enum(["WEBSITE_ONLY", "MARKETING_WEBSITE", "FULL_SERVICE"]),
  companyName: z.string().trim().min(2).max(160).optional(),
  ownerEmail: z.string().trim().toLowerCase().email().max(200).optional(),
  ownerName: z.string().trim().min(2).max(120).optional(),
  country: z.string().trim().max(80).optional(),
  projectTitle: z.string().trim().max(200).optional(),
  projectType: z.enum(["WEBSITE", "MARKETING", "AUTOMATION", "AI", "FULL_SERVICE"]).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  const id = await routeId(ctx.params);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = (body as { action?: unknown })?.action;

  try {
    if (action === "status") {
      const parsed = statusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid input" },
          { status: 400 },
        );
      }
      await setLeadStatus(id, parsed.data.status);
      void recordAuditRaw({
        actorEmail: `ip:${ipOf(request)}`,
        actorRole: "STAFF",
        action: "lifecycle.lead_status",
        targetType: "LEAD",
        targetLabel: id,
        metadata: { status: parsed.data.status },
      });
      return NextResponse.json({ ok: true, id, status: parsed.data.status });
    }

    if (action === "convert") {
      const parsed = convertSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid input" },
          { status: 400 },
        );
      }
      const { action: _drop, ...input } = parsed.data;
      const result = await convertLead(id, input);
      void recordAuditRaw({
        actorEmail: `ip:${ipOf(request)}`,
        actorRole: "STAFF",
        action: "lifecycle.lead_convert",
        targetType: "LEAD",
        targetLabel: id,
        metadata: { clientId: result.clientId, organizationId: result.organizationId },
      });
      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    }

    return NextResponse.json(
      { error: "action must be status or convert" },
      { status: 400 },
    );
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (typeof status === "number") {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Error" },
        { status },
      );
    }
    console.error("[lifecycle/leads:id] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function ipOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
