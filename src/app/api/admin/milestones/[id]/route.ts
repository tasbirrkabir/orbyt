import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { MILESTONE_STATUSES } from "@/lib/portal/domain";

/**
 * PATCH  /api/admin/milestones/[id] (staff only)
 * DELETE /api/admin/milestones/[id] (staff only)
 *
 * PATCH moves a milestone through DONE, ACTIVE, UPCOMING; a DONE move
 * stamps completedAt. DELETE removes the row; the computed progress
 * changes shape honestly on the next read.
 *   PATCH  200 { milestone } | 404
 *   DELETE 200 { ok: true } | 404
 */

const patchSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(400).optional(),
  status: z.enum(MILESTONE_STATUSES).optional(),
  dueDate: z.string().trim().datetime({ offset: true }).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const milestone = await db.milestone.findUnique({
      where: { id },
      include: { project: { select: { code: true, title: true, organizationId: true } } },
    });
    if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.milestone.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status
          ? {
              status: input.status,
              completedAt: input.status === "DONE" ? new Date() : null,
            }
          : {}),
        ...(input.dueDate !== undefined
          ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
          : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "milestone.update",
      organizationId: milestone.project.organizationId ?? undefined,
      targetType: "MILESTONE",
      targetLabel: `${milestone.project.code ?? milestone.project.title}: ${updated.title}`,
      metadata: { status: updated.status },
    });

    return NextResponse.json({
      milestone: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        position: updated.position,
        dueDate: updated.dueDate?.toISOString() ?? null,
        completedAt: updated.completedAt?.toISOString() ?? null,
      },
    });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const milestone = await db.milestone.findUnique({
      where: { id },
      include: { project: { select: { code: true, title: true, organizationId: true } } },
    });
    if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.milestone.delete({ where: { id } });

    await recordStaffAudit(context, {
      action: "milestone.delete",
      organizationId: milestone.project.organizationId ?? undefined,
      targetType: "MILESTONE",
      targetLabel: `${milestone.project.code ?? milestone.project.title}: ${milestone.title}`,
    });

    return NextResponse.json({ ok: true });
  });
}
