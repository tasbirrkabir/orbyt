import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { TIERS } from "@/lib/portal/domain";
import type { AdminOrgDetailPayload } from "@/lib/admin/types";

/**
 * GET   /api/admin/orgs/[id] (staff only)
 * PATCH /api/admin/orgs/[id] (staff only)
 *
 * GET: the full client record: profile, seats, projects, money queue.
 * PATCH: profile edits (name, tier, country). A tier change is a real
 * product change: it adds or removes portal rooms for the client.
 * Contract:
 *   GET   200 AdminOrgDetailPayload | 404
 *   PATCH 200 { org } | 404
 */

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  tier: z.enum(TIERS).optional(),
  country: z.string().trim().toUpperCase().length(2).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async () => {
    const org = await db.organization.findUnique({ where: { id } });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [users, projects, pendingCount, openCount, outstanding] = await Promise.all([
      db.user.findMany({
        where: { organizationId: id },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, role: true, activatedAt: true, createdAt: true },
      }),
      db.project.findMany({
        where: { organizationId: id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { milestones: true } } },
      }),
      db.approval.count({ where: { organizationId: id, status: "PENDING" } }),
      db.request.count({
        where: { organizationId: id, status: { in: ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"] } },
      }),
      db.invoice.aggregate({
        where: { organizationId: id, status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { totalCents: true },
      }),
    ]);

    const milestoneCounts = await db.milestone.groupBy({
      by: ["projectId", "status"],
      where: { project: { organizationId: id }, status: "DONE" },
      _count: { _all: true },
    });

    const payload: AdminOrgDetailPayload = {
      org: {
        id: org.id,
        name: org.name,
        clientId: org.clientId,
        tier: org.tier,
        country: org.country,
        createdAt: org.createdAt.toISOString(),
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        activated: Boolean(user.activatedAt),
        createdAt: user.createdAt.toISOString(),
      })),
      projects: projects.map((project) => {
        const done = milestoneCounts
          .filter((row) => row.projectId === project.id)
          .reduce((sum, row) => sum + row._count._all, 0);
        return {
          id: project.id,
          code: project.code,
          title: project.title,
          stage: project.stage,
          status: project.status,
          type: project.type,
          milestoneDone: done,
          milestoneTotal: project._count.milestones,
        };
      }),
      outstandingCents: outstanding._sum.totalCents ?? 0,
      openRequests: openCount,
      pendingApprovals: pendingCount,
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
    const org = await db.organization.findUnique({ where: { id } });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.organization.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.tier ? { tier: input.tier } : {}),
        ...(input.country ? { country: input.country } : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "org.update",
      organizationId: id,
      targetType: "ORG",
      targetLabel: `${updated.name} (${updated.clientId})`,
      metadata: {
        tier: updated.tier,
        nameChanged: Boolean(input.name && input.name !== org.name),
      },
    });

    return NextResponse.json({
      org: {
        id: updated.id,
        name: updated.name,
        clientId: updated.clientId,
        tier: updated.tier,
        country: updated.country,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  });
}
