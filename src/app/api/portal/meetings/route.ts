import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { MeetingsPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/meetings (protected)
 * Upcoming and completed meetings for the organization, timezone
 * labels handled client-side. Contract: 200 MeetingsPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const [upcomingRows, pastRows] = await Promise.all([
      db.meeting.findMany({
        where: { organizationId: context.organizationId, status: "UPCOMING" },
        orderBy: { startsAt: "asc" },
        include: { project: { select: { title: true } } },
      }),
      db.meeting.findMany({
        where: { organizationId: context.organizationId, status: "COMPLETED" },
        orderBy: { startsAt: "desc" },
        take: 10,
        include: { project: { select: { title: true } } },
      }),
    ]);

    const map = (meeting: (typeof upcomingRows)[number]) => ({
      id: meeting.id,
      title: meeting.title,
      startsAt: meeting.startsAt.toISOString(),
      durationMins: meeting.durationMins,
      agenda: meeting.agenda,
      status: meeting.status,
      notes: meeting.notes,
      decisions: meeting.decisions,
      projectTitle: meeting.project?.title ?? null,
    });

    const payload: MeetingsPayload = {
      identity: identityOf(context),
      upcoming: upcomingRows.map(map),
      past: pastRows.map(map),
    };
    return NextResponse.json(payload);
  });
}
