import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { SystemItem } from "@/lib/portal/types";

/**
 * GET /api/portal/systems (protected)
 * Full-service module: the digital infrastructure ORBYT manages for
 * this organization. Statuses are recorded facts, never derived.
 * Contract: 200 { systems: SystemItem[] } | 401 | 403 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    if (context.tier !== "FULL_SERVICE") {
      return NextResponse.json(
        { error: "Systems are not part of this engagement" },
        { status: 403 },
      );
    }

    const systems = await db.systemEntry.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { name: "asc" },
    });

    const items: SystemItem[] = systems.map((system) => {
      let connectedCount = 0;
      try {
        const parsed: unknown = JSON.parse(system.connectedJson);
        if (Array.isArray(parsed)) connectedCount = parsed.length;
      } catch {
        connectedCount = 0;
      }
      return {
        id: system.id,
        name: system.name,
        category: system.category,
        status: system.status,
        description: system.description,
        ownerLabel: system.ownerLabel,
        lastCheckedAt: system.lastCheckedAt?.toISOString() ?? null,
        connectedCount,
      };
    });

    return NextResponse.json({ identity: identityOf(context), systems: items });
  });
}
