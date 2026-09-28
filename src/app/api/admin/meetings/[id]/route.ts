import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit } from "@/lib/admin/records";

/**
 * PATCH /api/admin/meetings/[id] (staff only)
 *
 * Closes a meeting out: notes, decisions, status COMPLETED. The notes
 * land on the client record (activity), not just the row.
 * 200 { meeting } | 404
 */

const patchSchema = z.object({
  status: z.enum(["UPCOMING", "COMPLETED"]).optional(),
  notes: z.string().trim().max(4000).optional(),
  decisions: z.string().trim().max(4000).optional(),
  startsAt: z.string().trim().datetime({ offset: true }).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const row = await db.meeting.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.meeting.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.decisions !== undefined ? { decisions: input.decisions } : {}),
        ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}),
      },
    });

    const tasks: Promise<void>[] = [
      recordStaffAudit(context, {
        action: "meeting.update",
        organizationId: row.organizationId,
        targetType: "MEETING",
        targetLabel: updated.title,
        metadata: { status: updated.status },
      }),
    ];
    if (input.status === "COMPLETED" && row.status !== "COMPLETED") {
      tasks.push(
        recordStaffActivity(context, {
          organizationId: row.organizationId,
          type: "MEETING",
          title: `${updated.title} completed, notes on record`,
          targetType: "MEETING",
          targetLabel: updated.title,
          link: "/workspace/meetings",
        }),
      );
    }
    await Promise.all(tasks);

    return NextResponse.json({
      meeting: {
        id: updated.id,
        status: updated.status,
        notes: updated.notes,
        decisions: updated.decisions,
      },
    });
  });
}
