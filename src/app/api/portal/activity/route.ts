import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import { mapActivity } from "@/lib/portal/mappers";
import { ACTIVITY_TYPES } from "@/lib/portal/domain";
import type { ActivityPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/activity?type=PROJECT (protected)
 * The global chronological feed, optionally filtered by one of the
 * fixed event families. Contract: 200 ActivityPayload | 401 | 500.
 */
export async function GET(request: Request) {
  return portalRoute(async (context) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get("type") ?? "";

    const where: { organizationId: string; type?: string } = {
      organizationId: context.organizationId,
    };
    if (filter && (ACTIVITY_TYPES as readonly string[]).includes(filter)) {
      where.type = filter;
    }

    const events = await db.activityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const payload: ActivityPayload = {
      identity: identityOf(context),
      events: events.map(mapActivity),
    };
    return NextResponse.json(payload);
  });
}
