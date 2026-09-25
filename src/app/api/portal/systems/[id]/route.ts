import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute, routeId } from "@/lib/portal/api";
import type { SystemDetailPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/systems/[id] (protected)
 * One system: what it does, how it triggers, what it connects to,
 * its recorded checks and, for automations, the run history.
 * Contract: 200 SystemDetailPayload | 401 | 403 | 404 | 500.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    if (context.tier !== "FULL_SERVICE") {
      return NextResponse.json(
        { error: "Systems are not part of this engagement" },
        { status: 403 },
      );
    }
    const { id } = await params;

    const system = await db.systemEntry.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        checks: { orderBy: { checkedAt: "desc" } },
        runs: { orderBy: { ranAt: "desc" }, take: 12 },
      },
    });
    if (!system) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let connected: string[] = [];
    try {
      const parsed: unknown = JSON.parse(system.connectedJson);
      if (Array.isArray(parsed)) {
        connected = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      connected = [];
    }

    const payload: SystemDetailPayload = {
      identity: identityOf(context),
      system: {
        id: system.id,
        name: system.name,
        category: system.category,
        status: system.status,
        description: system.description,
        ownerLabel: system.ownerLabel,
        lastCheckedAt: system.lastCheckedAt?.toISOString() ?? null,
        lastUpdatedAt: system.lastUpdatedAt?.toISOString() ?? null,
        connectedCount: connected.length,
        trigger: system.trigger,
        actions: system.actions,
        connected,
      },
      checks: system.checks.map((check) => ({
        id: check.id,
        name: check.name,
        status: check.status,
        note: check.note,
        checkedAt: check.checkedAt.toISOString(),
      })),
      runs: system.runs.map((run) => ({
        id: run.id,
        summary: run.summary,
        status: run.status,
        ranAt: run.ranAt.toISOString(),
      })),
    };

    return NextResponse.json(payload);
  });
}
