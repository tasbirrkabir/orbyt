import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import type { AdminMeetingItem, AdminMeetingsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/meetings (staff only)
 * POST /api/admin/meetings (staff only)
 *
 * GET lists every meeting across tenants, soonest first.
 * POST schedules one and tells the client.
 *   GET  200 { meetings: AdminMeetingItem[] }
 *   POST 201 { meeting: AdminMeetingItem }
 */

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1).optional().nullable(),
  title: z.string().trim().min(3).max(140),
  startsAt: z.string().trim().datetime({ offset: true }),
  durationMins: z.coerce.number().int().min(5).max(480).default(30),
  agenda: z.string().trim().max(2000).default(""),
});

export async function GET() {
  return adminRoute(async () => {
    const meetings = await db.meeting.findMany({
      orderBy: [{ status: "asc" }, { startsAt: "asc" }],
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
      },
    });

    const payload: AdminMeetingsPayload = {
      meetings: meetings.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        projectId: row.projectId,
        projectTitle: row.project?.title ?? null,
        title: row.title,
        startsAt: row.startsAt.toISOString(),
        durationMins: row.durationMins,
        agenda: row.agenda,
        status: row.status,
        notes: row.notes,
        decisions: row.decisions,
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const org = await db.organization.findUnique({ where: { id: input.organizationId } });
    if (!org) {
      throw new z.ZodError([
        { code: "custom", path: ["organizationId"], message: "That client does not exist" },
      ]);
    }
    let projectId: string | null = null;
    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, organizationId: org.id },
        select: { id: true },
      });
      if (!project) {
        throw new z.ZodError([
          { code: "custom", path: ["projectId"], message: "That project is not on this client" },
        ]);
      }
      projectId = project.id;
    }

    const created = await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId,
        title: input.title,
        startsAt: new Date(input.startsAt),
        durationMins: input.durationMins,
        agenda: input.agenda,
        status: "UPCOMING",
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "MEETING",
        title: `Meeting scheduled: ${created.title}`,
        targetType: "MEETING",
        targetLabel: created.title,
        link: "/workspace/meetings",
      }),
      recordStaffNotification(context, {
        organizationId: org.id,
        type: "MEETING",
        title: `Meeting scheduled: ${created.title}`,
        body: created.agenda || "The agenda is on the meetings page.",
        link: "/workspace/meetings",
      }),
      recordStaffAudit(context, {
        action: "meeting.create",
        organizationId: org.id,
        targetType: "MEETING",
        targetLabel: created.title,
        metadata: { startsAt: created.startsAt.toISOString() },
      }),
    ]);

    const item: AdminMeetingItem = {
      id: created.id,
      organizationId: created.organizationId,
      organizationName: org.name,
      clientId: org.clientId,
      projectId: created.projectId,
      projectTitle: null,
      title: created.title,
      startsAt: created.startsAt.toISOString(),
      durationMins: created.durationMins,
      agenda: created.agenda,
      status: created.status,
      notes: created.notes,
      decisions: created.decisions,
    };
    return NextResponse.json({ meeting: item }, { status: 201 });
  });
}
