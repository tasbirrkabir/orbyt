import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import {
  buildAttention,
  buildNextUp,
  mapActivity,
  mapProjectSummary,
} from "@/lib/portal/mappers";
import type { OverviewPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/overview (protected)
 * The home screen in one query pass: identity, active project with
 * computed progress, the attention list, next up, the pulse (full
 * service only), recent activity, upcoming meetings, a billing
 * snapshot and the unread count. Everything org-scoped.
 *
 * Contract: 200 OverviewPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const orgId = context.organizationId;

    const [projects, pendingApprovals, waitingRequests, pendingInvoices, upcomingMeetings, events, systems, notifications, invoices, proposedCRs, unreadThreads] =
      await Promise.all([
        db.project.findMany({
          where: { organizationId: orgId, status: { notIn: ["ARCHIVED"] } },
          orderBy: [{ status: "asc" }, { startedAt: "desc" }],
          include: {
            milestones: { orderBy: { position: "asc" } },
            updates: { orderBy: { createdAt: "desc" }, take: 1 },
            approvals: { where: { status: "PENDING" }, select: { id: true, status: true } },
          },
        }),
        db.approval.findMany({ where: { organizationId: orgId, status: "PENDING" }, orderBy: { submittedAt: "desc" } }),
        db.request.findMany({ where: { organizationId: orgId, status: "WAITING_FOR_CLIENT" }, orderBy: { updatedAt: "desc" } }),
        db.invoice.findMany({ where: { organizationId: orgId, status: "PENDING" }, orderBy: { dueDate: "asc" } }),
        db.meeting.findMany({
          where: { organizationId: orgId, status: "UPCOMING", startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
        }),
        db.activityEvent.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 8 }),
        db.systemEntry.findMany({ where: { organizationId: orgId }, orderBy: { name: "asc" } }),
        db.notification.count({ where: { organizationId: orgId, readAt: null } }),
        db.invoice.findMany({ where: { organizationId: orgId, status: "PAID" }, orderBy: { paidAt: "desc" } }),
        // Change requests the client owes a decision on: proposed by
        // ORBYT, still undecided. Ones the client raised cannot be
        // decided by the client — the service layer forbids it.
        db.changeRequest.findMany({
          where: { organizationId: orgId, status: "PROPOSED", raisedBy: "ORBYT" },
          orderBy: { createdAt: "desc" },
          select: { id: true, code: true, title: true, impactNote: true, projectId: true, createdAt: true },
        }),
        // Conversations where the newest message is from the crew and
        // the client has not read it yet.
        db.messageThread.findMany({
          where: {
            organizationId: orgId,
            messages: { some: { senderRole: "ORBYT", readByClient: false } },
          },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            subject: true,
            updatedAt: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1, select: { senderRole: true, readByClient: true, createdAt: true } },
          },
        }),
      ]);

    // The project with the most momentum is "active": in progress or
    // in review, nearest target launch first.
    const activeProjectRow =
      projects
        .filter((p) => ["IN_PROGRESS", "IN_REVIEW", "BLOCKED"].includes(p.status))
        .sort((a, b) => (a.targetLaunchAt?.getTime() ?? Infinity) - (b.targetLaunchAt?.getTime() ?? Infinity))[0] ??
      projects[0] ??
      null;

    const attention = buildAttention({
      approvals: pendingApprovals.map((a) => ({ id: a.id, title: a.title, version: a.version, submittedAt: a.submittedAt })),
      requests: waitingRequests.map((r) => ({ id: r.id, code: r.code, title: r.title, updatedAt: r.updatedAt })),
      invoices: pendingInvoices.map((i) => ({ id: i.id, number: i.number, totalCents: i.totalCents, dueDate: i.dueDate })),
      changeRequests: proposedCRs.map((cr) => ({
        id: cr.id,
        code: cr.code,
        title: cr.title,
        impactNote: cr.impactNote,
        projectId: cr.projectId,
        createdAt: cr.createdAt,
      })),
      unreadThreads: unreadThreads
        .filter((thread) => {
          const last = thread.messages[0];
          return last && last.senderRole === "ORBYT" && !last.readByClient;
        })
        .map((thread) => ({ id: thread.id, subject: thread.subject, lastMessageAt: thread.updatedAt })),
    });

    const upcomingMilestones = projects.flatMap((p) =>
      p.milestones
        .filter((m) => m.status !== "DONE")
        .map((m) => ({ projectId: p.id, title: m.title, dueDate: m.dueDate })),
    );

    // Pulse: only where ORBYT actually manages systems (full service).
    // Health strings are recorded facts from the systems table; no
    // state is derived or invented here.
    const pulse =
      context.tier === "FULL_SERVICE" && systems.length > 0
        ? (() => {
            const worstRank: Record<string, number> = {
              HEALTHY: 0, ACTIVE: 0, MONITORING: 1, NOT_CONNECTED: 1, PAUSED: 2, WARNING: 3, ISSUE: 4, OFFLINE: 5,
            };
            const sorted = [...systems].sort((a, b) => (worstRank[b.status] ?? 0) - (worstRank[a.status] ?? 0));
            const healthy = systems.filter((s) => ["HEALTHY", "ACTIVE"].includes(s.status)).length;
            return {
              systems: systems.map((s) => ({ id: s.id, name: s.name, category: s.category, status: s.status })),
              healthyCount: healthy,
              totalCount: systems.length,
              worstStatus: sorted[0]?.status ?? null,
            };
          })()
        : null;

    const pendingTotalCents = pendingInvoices.reduce((sum, invoice) => sum + invoice.totalCents, 0);

    const payload: OverviewPayload = {
      identity: identityOf(context),
      greetingName: context.name.split(" ")[0] ?? context.name,
      activeProject: activeProjectRow ? mapProjectSummary(activeProjectRow) : null,
      projectCount: projects.length,
      attention,
      nextUp: buildNextUp({
        meetings: upcomingMeetings.map((m) => ({ id: m.id, title: m.title, startsAt: m.startsAt })),
        milestones: upcomingMilestones,
      }),
      pulse,
      recentActivity: events.map(mapActivity),
      upcomingMeetings: upcomingMeetings.slice(0, 3).map((m) => ({
        id: m.id,
        title: m.title,
        startsAt: m.startsAt.toISOString(),
        durationMins: m.durationMins,
      })),
      billing: pendingInvoices.length > 0 ? {
        pendingCount: pendingInvoices.length,
        pendingTotalCents,
        nextDueDate: pendingInvoices[0].dueDate.toISOString(),
      } : null,
      unreadNotifications: notifications,
    };

    void invoices;

    return NextResponse.json(payload);
  });
}
