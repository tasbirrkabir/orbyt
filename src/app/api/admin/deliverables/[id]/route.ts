import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { FILE_CATEGORIES } from "@/lib/portal/domain";

/**
 * PATCH /api/admin/deliverables/[id] (staff only)
 *
 * Edits a deliverable: version, link, detail, status, approval state.
 * Moving to DELIVERED stamps deliveredAt and notifies the client.
 * 200 { deliverable } | 404
 */

const DELIVERABLE_STATUSES = ["DELIVERED", "IN PREP"] as const;
const APPROVAL_STATES = ["DRAFT", "IN REVIEW", "APPROVED", "FINAL"] as const;

const patchSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  detail: z.string().trim().max(600).optional(),
  version: z.string().trim().min(1).max(20).optional(),
  category: z.enum(FILE_CATEGORIES).optional(),
  status: z.enum(DELIVERABLE_STATUSES).optional(),
  approvalState: z.enum(APPROVAL_STATES).optional(),
  link: z.string().trim().url().max(500).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const deliverable = await db.deliverable.findUnique({
      where: { id },
      include: { project: { select: { id: true, title: true, code: true, organizationId: true } } },
    });
    if (!deliverable || !deliverable.project.organizationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const orgId = deliverable.project.organizationId;

    const becameDelivered =
      input.status === "DELIVERED" && deliverable.status !== "DELIVERED";

    const updated = await db.deliverable.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.detail !== undefined ? { detail: input.detail } : {}),
        ...(input.version ? { version: input.version } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.status
          ? {
              status: input.status,
              deliveredAt: becameDelivered ? new Date() : deliverable.deliveredAt,
            }
          : {}),
        ...(input.approvalState ? { approvalState: input.approvalState } : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
      },
    });

    const tasks: Promise<void>[] = [
      recordStaffAudit(context, {
        action: "deliverable.update",
        organizationId: orgId,
        targetType: "DELIVERABLE",
        targetLabel: `${deliverable.project.code ?? deliverable.project.title}: ${updated.title} ${updated.version}`,
        metadata: { status: updated.status, approvalState: updated.approvalState },
      }),
    ];
    if (becameDelivered) {
      tasks.push(
        recordStaffActivity(context, {
          organizationId: orgId,
          type: "DELIVERABLE",
          title: `${updated.title} ${updated.version} delivered by email`,
          targetType: "DELIVERABLE",
          targetLabel: updated.title,
          link: "/workspace/deliverables",
        }),
        recordStaffNotification(context, {
          organizationId: orgId,
          type: "DELIVERABLE",
          title: `Delivered: ${updated.title} ${updated.version}`,
          body: updated.detail || "Details are on the deliverables page.",
          link: "/workspace/deliverables",
        }),
      );
    }
    await Promise.all(tasks);

    return NextResponse.json({
      deliverable: {
        id: updated.id,
        title: updated.title,
        detail: updated.detail,
        status: updated.status,
        channel: updated.channel,
        approvalState: updated.approvalState,
        version: updated.version,
        category: updated.category,
        link: updated.link,
        deliveredAt: updated.deliveredAt?.toISOString() ?? null,
      },
    });
  });
}
