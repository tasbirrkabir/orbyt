import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { PROJECT_STAGES, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/portal/domain";
import type { AdminProjectDetailPayload } from "@/lib/admin/types";

/**
 * GET   /api/admin/projects/[id] (staff only)
 * PATCH /api/admin/projects/[id] (staff only)
 *
 * GET: the full project record for the desk: milestones, crew log,
 * deliverables. PATCH: any project field.
 *   GET   200 AdminProjectDetailPayload | 404
 *   PATCH 200 { project } | 404
 */

const patchSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  type: z.enum(PROJECT_TYPES).optional(),
  stage: z.enum(PROJECT_STAGES).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  goal: z.string().trim().max(400).optional(),
  ownerLabel: z.string().trim().min(2).max(60).optional(),
  targetLaunchAt: z.string().trim().datetime({ offset: true }).nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async () => {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true, clientId: true } },
        _count: { select: { milestones: true } },
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [milestones, updates, deliverables, doneCount] = await Promise.all([
      db.milestone.findMany({ where: { projectId: id }, orderBy: { position: "asc" } }),
      db.projectUpdate.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
      db.deliverable.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
      db.milestone.count({ where: { projectId: id, status: "DONE" } }),
    ]);

    const payload: AdminProjectDetailPayload = {
      project: {
        id: project.id,
        organizationId: project.organizationId ?? "",
        organizationName: project.organization?.name ?? "No organization",
        clientId: project.organization?.clientId ?? "",
        code: project.code,
        title: project.title,
        stage: project.stage,
        status: project.status,
        type: project.type,
        goal: project.goal,
        ownerLabel: project.ownerLabel,
        targetLaunchAt: project.targetLaunchAt?.toISOString() ?? null,
        milestoneDone: doneCount,
        milestoneTotal: project._count.milestones,
        updatedAt: project.updatedAt.toISOString(),
      },
      milestones: milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        position: milestone.position,
        dueDate: milestone.dueDate?.toISOString() ?? null,
        completedAt: milestone.completedAt?.toISOString() ?? null,
      })),
      updates: updates.map((update) => ({
        id: update.id,
        tag: update.tag,
        title: update.title,
        body: update.body,
        acknowledgedAt: update.acknowledgedAt?.toISOString() ?? null,
        createdAt: update.createdAt.toISOString(),
      })),
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
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.project.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.stage ? { stage: input.stage } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.goal !== undefined ? { goal: input.goal } : {}),
        ...(input.ownerLabel ? { ownerLabel: input.ownerLabel } : {}),
        ...(input.targetLaunchAt !== undefined
          ? { targetLaunchAt: input.targetLaunchAt ? new Date(input.targetLaunchAt) : null }
          : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "project.update",
      organizationId: updated.organizationId ?? undefined,
      targetType: "PROJECT",
      targetLabel: `${updated.code ?? ""} ${updated.title}`.trim(),
      metadata: {
        stage: updated.stage,
        status: updated.status,
        titleChanged: Boolean(input.title && input.title !== project.title),
      },
    });

    return NextResponse.json({
      project: {
        id: updated.id,
        title: updated.title,
        stage: updated.stage,
        status: updated.status,
      },
    });
  });
}
