import { NextResponse } from "next/server";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { db } from "@/lib/db";

/**
 * GET /api/internal/overview (staff key required)
 *
 * The one-glance ops snapshot for the staff console: where the funnel
 * stands, what needs a decision, and what the machine has been doing.
 * Every number is a stored fact, counted live; there is nothing here
 * to estimate, so nothing is estimated.
 *
 * Contract:
 *   200 { ok, leads, tenants, projects, work, email, audit }
 *   401 bad key | 429 throttled | 503 not configured
 */

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];
const ATTENTION_HEALTHS = ["AT_RISK", "OFF_TRACK", "ON_HOLD"];

export async function GET(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  try {
    const [
      leadGroups,
      orgCount,
      recentOrgs,
      projectGroups,
      projectCount,
      pendingApprovals,
      openRequests,
      proposedCRs,
      emailGroups,
      auditRows,
    ] = await Promise.all([
      db.contactSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
      db.organization.count(),
      db.organization.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          clientId: true,
          tier: true,
          createdAt: true,
          _count: { select: { users: true, projects: true } },
        },
      }),
      db.project.groupBy({ by: ["health"], _count: { _all: true } }),
      db.project.count(),
      db.approval.count({ where: { status: "PENDING" } }),
      db.request.count({ where: { status: { in: OPEN_REQUEST_STATUSES } } }),
      db.changeRequest.findMany({
        where: { status: "PROPOSED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          code: true,
          title: true,
          raisedBy: true,
          raisedByName: true,
          createdAt: true,
          project: { select: { id: true, code: true, title: true } },
        },
      }),
      db.emailMessage.groupBy({ by: ["status"], _count: { _all: true } }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          actorEmail: true,
          actorRole: true,
          action: true,
          targetType: true,
          targetLabel: true,
          createdAt: true,
        },
      }),
    ]);

    const leads: Record<string, number> = {};
    for (const row of leadGroups) leads[row.status] = row._count._all;
    const projectHealth: Record<string, number> = {};
    for (const row of projectGroups) {
      projectHealth[row.health || "UNASSESSED"] = row._count._all;
    }
    const email: Record<string, number> = {};
    for (const row of emailGroups) email[row.status] = row._count._all;

    const attention = ATTENTION_HEALTHS.reduce(
      (sum, key) => sum + (projectHealth[key] ?? 0),
      0,
    );

    return NextResponse.json({
      ok: true,
      leads,
      tenants: {
        count: orgCount,
        recent: recentOrgs.map((org) => ({
          id: org.id,
          name: org.name,
          clientId: org.clientId,
          tier: org.tier,
          createdAt: org.createdAt,
          users: org._count.users,
          projects: org._count.projects,
        })),
      },
      projects: {
        count: projectCount,
        health: projectHealth,
        needingAttention: attention,
      },
      work: {
        pendingApprovals,
        openRequests,
        proposedChangeRequests: proposedCRs.map((cr) => ({
          id: cr.id,
          code: cr.code,
          title: cr.title,
          raisedBy: cr.raisedBy,
          raisedByName: cr.raisedByName,
          createdAt: cr.createdAt,
          projectId: cr.project.id,
          projectCode: cr.project.code,
          projectTitle: cr.project.title,
        })),
      },
      email,
      audit: auditRows,
    });
  } catch (error) {
    console.error("[internal/overview] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
