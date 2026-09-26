import { NextResponse } from "next/server";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { db } from "@/lib/db";

/**
 * GET /api/lifecycle/leads (staff key required)
 *
 * The lead pipeline for staff: every contact submission with its
 * lifecycle status, newest first, plus status counts. This is the
 * read side of LEAD -> CLIENT; conversion and status changes happen
 * on the individual lead routes.
 *
 * Contract:
 *   200 { ok, counts, leads: [{ id, name, email, topic, status, createdAt,
 *          convertedOrganizationId, hasProject }] }
 *   401 bad key | 429 throttled | 503 not configured
 *
 * `limit` caps the page (default 50, max 200). No PII beyond what the
 * key holder already owns.
 */

export async function GET(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200) : 50;

    const [leads, grouped] = await Promise.all([
      db.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          topic: true,
          message: true,
          status: true,
          convertedOrganizationId: true,
          createdAt: true,
        },
      }),
      db.contactSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const counts: Record<string, number> = {};
    for (const row of grouped) {
      counts[row.status] = row._count._all;
    }

    return NextResponse.json({
      ok: true,
      counts,
      leads: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        topic: lead.topic,
        status: lead.status,
        messagePreview: lead.message.slice(0, 280),
        convertedOrganizationId: lead.convertedOrganizationId,
        createdAt: lead.createdAt,
      })),
    });
  } catch (error) {
    console.error("[lifecycle/leads] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
