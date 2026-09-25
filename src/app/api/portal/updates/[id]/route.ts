import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson, routeId } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";

/**
 * PATCH /api/portal/updates/[id] (protected, writers only)
 * The client's sign-off on a shipped update. The update must belong
 * to a project inside the caller's organization: a foreign id is a
 * 404. Sign-off is one-way (an approval is a record, not a toggle);
 * re-approving is idempotent and returns the original timestamp.
 * Contract: 200 { acknowledgedAt } | 400 | 401 | 403 | 404 | 500.
 */

const ackSchema = z.object({
  acknowledged: z.literal(true),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(
      async (context) => {
    const id = await routeId(params);
    await readJson(request, ackSchema);

    const update = await db.projectUpdate.findFirst({
      where: { id, project: { organizationId: context.organizationId } },
      select: { id: true, acknowledgedAt: true, title: true, projectId: true },
    });
    if (!update) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Idempotent: an approval already on record is simply returned.
    if (update.acknowledgedAt) {
      return NextResponse.json({ acknowledgedAt: update.acknowledgedAt });
    }

    const saved = await db.projectUpdate.update({
      where: { id: update.id },
      data: { acknowledgedAt: new Date() },
      select: { acknowledgedAt: true },
    });

    await Promise.all([
      recordActivity(context, {
        type: "PROJECT",
        title: `Update approved: ${update.title}`,
        actorRole: "CLIENT",
        targetType: "UPDATE",
        targetLabel: update.title,
        link: update.projectId ? `/workspace/projects/${update.projectId}` : "/workspace/projects",
      }),
      recordAudit(context, {
        action: "update.acknowledge",
        targetType: "UPDATE",
        targetLabel: update.title,
        metadata: { updateId: update.id },
      }),
    ]);

    return NextResponse.json({ acknowledgedAt: saved.acknowledgedAt });
  }, { write: true });
}
