import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { REQUEST_PRIORITIES, REQUEST_STATUSES } from "@/lib/portal/domain";

/**
 * PATCH /api/admin/requests/[id] (staff only)
 *
 * Moves a request through its lifecycle or re-grades its priority.
 * Status changes post activity so the client sees the queue move.
 * 200 { request } | 404
 */

const patchSchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  priority: z.enum(REQUEST_PRIORITIES).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const row = await db.request.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.request.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.priority ? { priority: input.priority } : {}),
      },
    });

    const tasks: Promise<void>[] = [
      recordStaffAudit(context, {
        action: "request.update",
        organizationId: row.organizationId,
        targetType: "REQUEST",
        targetLabel: updated.code,
        metadata: { status: updated.status, priority: updated.priority },
      }),
    ];
    if (input.status && input.status !== row.status) {
      tasks.push(
        recordStaffActivity(context, {
          organizationId: row.organizationId,
          type: "REQUEST",
          title: `${updated.code} is now ${input.status.replaceAll("_", " ").toLowerCase()}`,
          targetType: "REQUEST",
          targetLabel: updated.code,
          link: `/workspace/requests/${updated.id}`,
        }),
        recordStaffNotification(context, {
          organizationId: row.organizationId,
          type: "REQUEST",
          title: `${updated.code} status: ${input.status.replaceAll("_", " ").toLowerCase()}`,
          body: updated.title,
          link: `/workspace/requests/${updated.id}`,
        }),
      );
    }
    await Promise.all(tasks);

    return NextResponse.json({
      request: {
        id: updated.id,
        status: updated.status,
        priority: updated.priority,
      },
    });
  });
}
