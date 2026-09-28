import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminRoute } from "@/lib/admin/api";
import type {
  AdminAttentionItem,
  AdminAuditItem,
  AdminOverviewPayload,
} from "@/lib/admin/types";

/**
 * GET /api/admin/overview (staff only)
 *
 * The desk's opening screen: live counts across every tenant, the
 * three work queues (approvals, requests, threads) and the newest
 * audit rows. Every number is a real count; nothing is derived or
 * decorated.
 * 200 AdminOverviewPayload | 401
 */

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];
const ACTIVE_PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"];

export async function GET() {
  return adminRoute(async (context) => {
    const [
      clients,
      activeProjects,
      pendingApprovals,
      openRequests,
      awaitingThreads,
      outstanding,
      overdueInvoices,
      systemsAttention,
      approvalRows,
      requestRows,
      threadRows,
      auditRows,
    ] = await Promise.all([
      db.organization.count(),
      db.project.count({ where: { status: { in: ACTIVE_PROJECT_STATUSES } } }),
      db.approval.count({ where: { status: "PENDING" } }),
      db.request.count({ where: { status: { in: OPEN_REQUEST_STATUSES } } }),
      db.messageThread.count({
        where: { messages: { some: { senderRole: "CLIENT", readByClient: false } } },
      }),
      db.invoice.aggregate({
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { totalCents: true },
      }),
      db.invoice.count({ where: { status: "OVERDUE" } }),
      db.systemEntry.count({ where: { status: { in: ["WARNING", "ISSUE", "OFFLINE"] } } }),
      db.approval.findMany({
        where: { status: "PENDING" },
        orderBy: { submittedAt: "asc" },
        take: 6,
        include: { organization: { select: { name: true, clientId: true } } },
      }),
      db.request.findMany({
        where: { status: { in: OPEN_REQUEST_STATUSES } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { organization: { select: { name: true, clientId: true } } },
      }),
      db.messageThread.findMany({
        where: { messages: { some: { senderRole: "CLIENT", readByClient: false } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { organization: { select: { name: true, clientId: true } } },
      }),
      db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

    const orgName = (org: { name: string; clientId: string } | null) =>
      org ? `${org.name} · ${org.clientId}` : "";

    const approvals: AdminAttentionItem[] = approvalRows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: orgName(row.organization),
      clientId: row.organization?.clientId ?? "",
      label: `${row.title} ${row.version}`,
      meta: row.type,
      link: "/admin/approvals",
    }));

    const requests: AdminAttentionItem[] = requestRows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: orgName(row.organization),
      clientId: row.organization?.clientId ?? "",
      label: `${row.code}: ${row.title}`,
      meta: row.status,
      link: `/admin/requests?open=${row.id}`,
    }));

    const threads: AdminAttentionItem[] = threadRows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: orgName(row.organization),
      clientId: row.organization?.clientId ?? "",
      label: row.subject,
      meta: "Awaiting reply",
      link: `/admin/messages/${row.id}`,
    }));

    const audit: AdminAuditItem[] = auditRows.map((row) => ({
      id: row.id,
      actorEmail: row.actorEmail,
      actorRole: row.actorRole,
      action: row.action,
      targetType: row.targetType,
      targetLabel: row.targetLabel,
      organizationName: null,
      createdAt: row.createdAt.toISOString(),
    }));

    const payload: AdminOverviewPayload = {
      identity: { name: context.name, email: context.email, role: "ADMIN" },
      stats: {
        clients,
        activeProjects,
        pendingApprovals,
        openRequests,
        threadsAwaitingReply: awaitingThreads,
        outstandingCents: outstanding._sum.totalCents ?? 0,
        overdueInvoices,
        systemsAttention,
      },
      approvals,
      requests,
      threads,
      audit,
    };
    return NextResponse.json(payload);
  });
}
