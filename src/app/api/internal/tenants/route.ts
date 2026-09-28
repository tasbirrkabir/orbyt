import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireProvisionKey } from "@/lib/lifecycle/guard";

/**
 * GET /api/internal/tenants (staff key required)
 *
 * The tenant roster with attention counts, so the console can show
 * which tenants need a human today. Every number is a stored fact:
 * threads whose latest message is still the client's, pending
 * approvals, open requests, and invoices due.
 *
 * Contract: 200 { tenants } | 401 | 429 | 503.
 */

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];

export async function GET(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  try {
    const orgs = await db.organization.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        clientId: true,
        tier: true,
        createdAt: true,
        users: { select: { id: true, name: true, email: true } },
        projects: {
          select: { id: true, code: true, title: true, status: true, health: true, targetLaunchAt: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { projects: true, users: true } },
      },
    });

    const [pendingApprovals, openRequests, threads, dueInvoices] = await Promise.all([
      db.approval.groupBy({ by: ["organizationId"], where: { status: "PENDING" }, _count: { _all: true } }),
      db.request.groupBy({ by: ["organizationId"], where: { status: { in: OPEN_REQUEST_STATUSES } }, _count: { _all: true } }),
      db.messageThread.findMany({
        select: {
          organizationId: true,
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { senderRole: true } },
        },
      }),
      db.invoice.groupBy({
        by: ["organizationId"],
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        _count: { _all: true },
        _sum: { totalCents: true },
      }),
    ]);

    const approvalsByOrg = new Map(pendingApprovals.map((row) => [row.organizationId, row._count._all]));
    const requestsByOrg = new Map(openRequests.map((row) => [row.organizationId, row._count._all]));
    const dueByOrg = new Map(
      dueInvoices.map((row) => [row.organizationId, { count: row._count._all, totalCents: row._sum.totalCents ?? 0 }]),
    );
    // A thread needs a reply when its newest message is the client's.
    const needsReplyByOrg = new Map<string, number>();
    for (const thread of threads) {
      const last = thread.messages[0];
      if (last && last.senderRole === "CLIENT") {
        needsReplyByOrg.set(thread.organizationId, (needsReplyByOrg.get(thread.organizationId) ?? 0) + 1);
      }
    }

    const tenants = orgs.map((org) => ({
      id: org.id,
      name: org.name,
      clientId: org.clientId,
      tier: org.tier,
      createdAt: org.createdAt.toISOString(),
      users: org.users.map((user) => ({ id: user.id, name: user.name, email: user.email })),
      projects: org.projects.map((project) => ({
        id: project.id,
        code: project.code,
        title: project.title,
        status: project.status,
        health: project.health,
        targetLaunchAt: project.targetLaunchAt?.toISOString() ?? null,
      })),
      attention: {
        needsReply: needsReplyByOrg.get(org.id) ?? 0,
        pendingApprovals: approvalsByOrg.get(org.id) ?? 0,
        openRequests: requestsByOrg.get(org.id) ?? 0,
        dueInvoices: dueByOrg.get(org.id)?.count ?? 0,
        dueInvoiceTotalCents: dueByOrg.get(org.id)?.totalCents ?? 0,
      },
    }));

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error("[internal/tenants] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
