import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { FILE_CATEGORIES } from "@/lib/portal/domain";

/**
 * POST /api/admin/deliverables (staff only)
 *
 * Adds a deliverable to a project. The org is derived from the
 * project, never from the body. DELIVERED stamps deliveredAt and
 * tells the client by notification.
 * 201 { deliverable } | 400 | 404
 */

const DELIVERABLE_STATUSES = ["DELIVERED", "IN PREP"] as const;
const APPROVAL_STATES = ["DRAFT", "IN REVIEW", "APPROVED", "FINAL"] as const;

const createSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(140),
  detail: z.string().trim().max(600).default(""),
  version: z.string().trim().min(1).max(20).default("v1"),
  category: z.enum(FILE_CATEGORIES).default("OTHER"),
  status: z.enum(DELIVERABLE_STATUSES).default("IN PREP"),
  approvalState: z.enum(APPROVAL_STATES).default("DRAFT"),
  link: z.string().trim().url().max(500).optional().nullable(),
});

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, title: true, code: true, organizationId: true },
    });
    if (!project || !project.organizationId) {
      throw new z.ZodError([
        { code: "custom", path: ["projectId"], message: "That project does not exist" },
      ]);
    }

    const created = await db.deliverable.create({
      data: {
        projectId: project.id,
        title: input.title,
        detail: input.detail,
        version: input.version,
        category: input.category,
        status: input.status,
        approvalState: input.approvalState,
        channel: "EMAIL",
        link: input.link ?? null,
        deliveredAt: input.status === "DELIVERED" ? new Date() : null,
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: project.organizationId,
        type: "DELIVERABLE",
        title:
          created.status === "DELIVERED"
            ? `${created.title} ${created.version} delivered by email`
            : `${created.title} ${created.version} added to the plan`,
        targetType: "DELIVERABLE",
        targetLabel: created.title,
        link: "/workspace/deliverables",
      }),
      recordStaffNotification(context, {
        organizationId: project.organizationId,
        type: "DELIVERABLE",
        title:
          created.status === "DELIVERED"
            ? `Delivered: ${created.title} ${created.version}`
            : `In prep: ${created.title} ${created.version}`,
        body: created.detail || "Details are on the deliverables page.",
        link: "/workspace/deliverables",
      }),
      recordStaffAudit(context, {
        action: "deliverable.create",
        organizationId: project.organizationId,
        targetType: "DELIVERABLE",
        targetLabel: `${project.code ?? project.title}: ${created.title} ${created.version}`,
        metadata: { status: created.status, approvalState: created.approvalState },
      }),
    ]);

    return NextResponse.json(
      {
        deliverable: {
          id: created.id,
          title: created.title,
          detail: created.detail,
          status: created.status,
          channel: created.channel,
          approvalState: created.approvalState,
          version: created.version,
          category: created.category,
          link: created.link,
          deliveredAt: created.deliveredAt?.toISOString() ?? null,
        },
      },
      { status: 201 },
    );
  });
}
