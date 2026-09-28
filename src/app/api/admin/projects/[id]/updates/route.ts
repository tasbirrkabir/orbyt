import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";

/**
 * POST /api/admin/projects/[id]/updates (staff only)
 *
 * Posts a crew-log update the client reads (and signs off when the tag
 * is SHIPPED). Fires the client notification and the activity entry in
 * the same pass.
 * 201 { update } | 400 | 404
 */

const TAGS = ["SHIPPED", "IN PROGRESS", "NOTE"] as const;

const createSchema = z.object({
  tag: z.enum(TAGS).default("NOTE"),
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(4).max(4000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const project = await db.project.findUnique({
      where: { id },
      include: { organization: { select: { clientId: true } } },
    });
    if (!project || !project.organization || !project.organizationId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const created = await db.projectUpdate.create({
      data: {
        projectId: id,
        tag: input.tag,
        title: input.title,
        body: input.body,
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: project.organizationId,
        type: "PROJECT",
        title: `Crew log: ${created.title}`,
        targetType: "PROJECT",
        targetLabel: project.title,
        link: `/workspace/projects/${project.id}?tab=log`,
      }),
      recordStaffNotification(context, {
        organizationId: project.organizationId,
        type: "PROJECT",
        title: `Crew log: ${created.title}`,
        body: created.body.slice(0, 160),
        link: `/workspace/projects/${project.id}?tab=log`,
      }),
      recordStaffAudit(context, {
        action: "update.create",
        organizationId: project.organizationId,
        targetType: "PROJECT",
        targetLabel: `${project.code ?? project.title}: ${created.title}`,
        metadata: { tag: created.tag },
      }),
    ]);

    return NextResponse.json(
      {
        update: {
          id: created.id,
          tag: created.tag,
          title: created.title,
          body: created.body,
          acknowledgedAt: created.acknowledgedAt?.toISOString() ?? null,
          createdAt: created.createdAt.toISOString(),
        },
        clientId: project.organization.clientId,
      },
      { status: 201 },
    );
  });
}
