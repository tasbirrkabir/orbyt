import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { nextStaffCode, recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { PROJECT_STAGES, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/portal/domain";
import type { AdminProjectItem, AdminProjectsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/projects (staff only)
 * POST /api/admin/projects (staff only)
 *
 * GET lists every project across tenants, optionally filtered by org
 * with ?orgId=. POST creates a project for a client: human code
 * PRJ-XXX per org, activity + notification on record.
 *   GET  200 { projects: AdminProjectItem[] }
 *   POST 201 { project: AdminProjectItem } | 400 | 404
 */

const ACTIVE_PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"];

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(120),
  type: z.enum(PROJECT_TYPES).default("WEBSITE"),
  stage: z.enum(PROJECT_STAGES).default("DISCOVER"),
  status: z.enum(PROJECT_STATUSES).default("PLANNING"),
  goal: z.string().trim().max(400).default(""),
  ownerLabel: z.string().trim().min(2).max(60).default("ORBYT crew"),
  targetLaunchAt: z.string().trim().datetime({ offset: true }).optional().nullable(),
});

function mapProject(project: {
  id: string;
  organizationId: string | null;
  organization?: { name: string; clientId: string } | null;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  goal: string;
  ownerLabel: string;
  targetLaunchAt: Date | null;
  updatedAt: Date;
  _count?: { milestones: number };
  milestonesDone?: number;
}): AdminProjectItem {
  return {
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
    milestoneDone: project.milestonesDone ?? 0,
    milestoneTotal: project._count?.milestones ?? 0,
    updatedAt: project.updatedAt.toISOString(),
  };
}

const projectInclude = {
  organization: { select: { name: true, clientId: true } },
  _count: { select: { milestones: true } },
} as const;

export async function GET(request: Request) {
  return adminRoute(async () => {
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");
    const projects = await db.project.findMany({
      where: orgId ? { organizationId: orgId } : {},
      orderBy: { updatedAt: "desc" },
      include: projectInclude,
    });
    const doneCounts = await db.milestone.groupBy({
      by: ["projectId"],
      where: { status: "DONE", ...(orgId ? { project: { organizationId: orgId } } : {}) },
      _count: { _all: true },
    });
    const doneByProject = new Map(doneCounts.map((row) => [row.projectId, row._count._all]));
    const payload: AdminProjectsPayload = {
      projects: projects.map((project) =>
        mapProject({ ...project, milestonesDone: doneByProject.get(project.id) ?? 0 }),
      ),
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
    // Projects carry the creating seat on the row; the org owner is
    // the stable anchor for client-owned rows.
    const anchor = await db.user.findFirst({
      where: { organizationId: org.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!anchor) {
      throw new z.ZodError([
        { code: "custom", path: ["organizationId"], message: "Create a seat for this client first" },
      ]);
    }

    const code = await nextStaffCode(org.id, "PRJ");
    const created = await db.project.create({
      data: {
        userId: anchor.id,
        organizationId: org.id,
        code,
        title: input.title,
        type: input.type,
        stage: input.stage,
        status: input.status,
        goal: input.goal,
        ownerLabel: input.ownerLabel,
        targetLaunchAt: input.targetLaunchAt ? new Date(input.targetLaunchAt) : null,
      },
      include: projectInclude,
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "PROJECT",
        title: `Project started: ${created.title}`,
        targetType: "PROJECT",
        targetLabel: created.title,
        link: "/workspace/projects",
      }),
      recordStaffNotification(context, {
        organizationId: org.id,
        type: "PROJECT",
        title: `Project started: ${created.title}`,
        body: input.goal || "The crew posted the first project. Follow it from Projects.",
        link: "/workspace/projects",
      }),
      recordStaffAudit(context, {
        action: "project.create",
        organizationId: org.id,
        targetType: "PROJECT",
        targetLabel: `${code} ${created.title}`,
        metadata: { type: created.type, status: created.status },
      }),
    ]);

    return NextResponse.json({ project: mapProject({ ...created, milestonesDone: 0 }) }, { status: 201 });
  });
}
