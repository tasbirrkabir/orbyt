import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";

/**
 * POST /api/admin/projects/[id]/milestones (staff only)
 *
 * Appends a milestone at the end of the rail. Progress on the client
 * portal is computed from these rows, never typed.
 * 201 { milestone } | 400 | 404
 */

const createSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(400).default(""),
  dueDate: z.string().trim().datetime({ offset: true }).optional().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const last = await db.milestone.findFirst({
      where: { projectId: id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const created = await db.milestone.create({
      data: {
        projectId: id,
        title: input.title,
        description: input.description,
        position: (last?.position ?? 0) + 1,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });

    await recordStaffAudit(context, {
      action: "milestone.create",
      organizationId: project.organizationId ?? undefined,
      targetType: "MILESTONE",
      targetLabel: `${project.code ?? project.title}: ${created.title}`,
    });

    return NextResponse.json(
      {
        milestone: {
          id: created.id,
          title: created.title,
          description: created.description,
          status: created.status,
          position: created.position,
          dueDate: created.dueDate?.toISOString() ?? null,
          completedAt: created.completedAt?.toISOString() ?? null,
        },
      },
      { status: 201 },
    );
  });
}
