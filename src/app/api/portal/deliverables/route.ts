import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { DeliverablesPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/deliverables (protected)
 * The deliverable index, flat across the organization's projects,
 * newest first. Email is the transport; this is the record of what
 * exists, when it landed and where. Contract:
 * 200 DeliverablesPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const deliverables = await db.deliverable.findMany({
      where: { project: { organizationId: context.organizationId } },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, title: true } } },
    });

    const payload: DeliverablesPayload = {
      identity: identityOf(context),
      deliverables: deliverables.map((deliverable) => ({
        id: deliverable.id,
        title: deliverable.title,
        detail: deliverable.detail,
        status: deliverable.status,
        channel: deliverable.channel,
        approvalState: deliverable.approvalState,
        version: deliverable.version,
        category: deliverable.category,
        link: deliverable.link,
        deliveredAt: deliverable.deliveredAt?.toISOString() ?? null,
        createdAt: deliverable.createdAt.toISOString(),
        projectId: deliverable.project?.id ?? null,
        projectTitle: deliverable.project?.title ?? null,
      })),
    };
    return NextResponse.json(payload);
  });
}
