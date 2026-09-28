import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { progressFromMilestones } from "@/lib/portal/mappers";

/**
 * GET /api/internal/tenants/[id] (staff key required)
 *
 * The full tenant plate: everything a crew member needs to serve this
 * client in one read — people, projects with recorded health, the
 * message inbox with needs-reply flags, request triage state, pending
 * approvals, deliverables, files, invoices (with unconfirmed payment
 * claims), meetings, and the recent ledger. All org-scoped by the id
 * in the path.
 *
 * Contract: 200 plate | 401 | 404 | 429 | 503.
 */

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const org = await db.organization.findUnique({
      where: { id },
      select: { id: true, name: true, clientId: true, tier: true, country: true, createdAt: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const [users, projects, threads, requests, approvals, deliverables, files, invoices, meetings, activity] =
      await Promise.all([
        db.user.findMany({
          where: { organizationId: org.id },
          select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
          orderBy: { createdAt: "asc" },
        }),
        db.project.findMany({
          where: { organizationId: org.id },
          orderBy: { createdAt: "asc" },
          select: {
            id: true, code: true, title: true, type: true, status: true, stage: true,
            health: true, healthNote: true, healthUpdatedAt: true,
            targetLaunchAt: true,
            milestones: { select: { status: true } },
          },
        }),
        db.messageThread.findMany({
          where: { organizationId: org.id },
          orderBy: { updatedAt: "desc" },
          take: 25,
          select: {
            id: true, subject: true, context: true, projectId: true, updatedAt: true,
            project: { select: { title: true } },
            messages: {
              orderBy: { createdAt: "asc" },
              select: { id: true, senderName: true, senderRole: true, body: true, readByClient: true, createdAt: true },
            },
          },
        }),
        db.request.findMany({
          where: { organizationId: org.id },
          orderBy: { updatedAt: "desc" },
          take: 25,
          select: {
            id: true, code: true, title: true, category: true, priority: true, status: true,
            description: true, createdAt: true, updatedAt: true,
            comments: { orderBy: { createdAt: "asc" }, select: { authorName: true, authorRole: true, body: true, createdAt: true } },
          },
        }),
        db.approval.findMany({
          where: { organizationId: org.id },
          orderBy: { submittedAt: "desc" },
          take: 20,
          select: {
            id: true, title: true, type: true, version: true, status: true, description: true,
            submittedAt: true, decidedAt: true, decisionComment: true,
            project: { select: { id: true, title: true } },
          },
        }),
        db.deliverable.findMany({
          where: { project: { organizationId: org.id } },
          orderBy: { createdAt: "desc" },
          take: 15,
          select: { id: true, title: true, status: true, approvalState: true, version: true, category: true, deliveredAt: true, link: true },
        }),
        db.portalFile.findMany({
          where: { organizationId: org.id },
          orderBy: { uploadedAt: "desc" },
          take: 15,
          select: { id: true, name: true, kind: true, status: true, category: true, note: true, uploadedAt: true, link: true },
        }),
        db.invoice.findMany({
          where: { organizationId: org.id },
          orderBy: { issueDate: "desc" },
          include: { payments: { orderBy: { paidAt: "desc" } } },
        }),
        db.meeting.findMany({
          where: { organizationId: org.id },
          orderBy: { startsAt: "desc" },
          take: 15,
          select: { id: true, title: true, startsAt: true, durationMins: true, agenda: true, status: true, notes: true, decisions: true },
        }),
        db.activityEvent.findMany({
          where: { organizationId: org.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, type: true, title: true, actorName: true, actorRole: true, createdAt: true },
        }),
      ]);

    const threadShapes = threads.map((thread) => {
      const last = thread.messages[thread.messages.length - 1];
      return {
        id: thread.id,
        subject: thread.subject,
        context: thread.context,
        projectId: thread.projectId,
        projectTitle: thread.project?.title ?? null,
        updatedAt: thread.updatedAt.toISOString(),
        needsReply: last ? last.senderRole === "CLIENT" : false,
        unreadForClient: thread.messages.filter((m) => m.senderRole === "ORBYT" && !m.readByClient).length,
        messages: thread.messages.map((m) => ({
          id: m.id,
          senderName: m.senderName,
          senderRole: m.senderRole,
          body: m.body,
          readByClient: m.readByClient,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    });

    const dueInvoices = invoices.filter((invoice) => ["PENDING", "OVERDUE"].includes(invoice.status));
    const claimedInvoices = dueInvoices.filter((invoice) => invoice.payments.length > 0);

    const plate = {
      organization: {
        ...org,
        createdAt: org.createdAt.toISOString(),
      },
      users: users.map((user) => ({
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      })),
      projects: projects.map((project) => ({
        ...project,
        progress: progressFromMilestones(project.milestones),
        targetLaunchAt: project.targetLaunchAt?.toISOString() ?? null,
        healthUpdatedAt: project.healthUpdatedAt?.toISOString() ?? null,
        milestones: undefined,
      })),
      threads: threadShapes,
      requests: requests.map((request) => ({
        ...request,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        comments: request.comments.map((comment) => ({ ...comment, createdAt: comment.createdAt.toISOString() })),
      })),
      approvals: approvals.map((approval) => ({
        ...approval,
        submittedAt: approval.submittedAt.toISOString(),
        decidedAt: approval.decidedAt?.toISOString() ?? null,
      })),
      deliverables: deliverables.map((deliverable) => ({
        ...deliverable,
        deliveredAt: deliverable.deliveredAt?.toISOString() ?? null,
      })),
      files: files.map((file) => ({ ...file, uploadedAt: file.uploadedAt.toISOString() })),
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        description: invoice.description,
        totalCents: invoice.totalCents,
        currency: invoice.currency,
        status: invoice.status,
        paidAt: invoice.paidAt?.toISOString() ?? null,
        method: invoice.method,
        payments: invoice.payments.map((payment) => ({
          id: payment.id,
          amountCents: payment.amountCents,
          method: payment.method,
          reference: payment.reference,
          paidAt: payment.paidAt.toISOString(),
        })),
      })),
      meetings: meetings.map((meeting) => ({ ...meeting, startsAt: meeting.startsAt.toISOString() })),
      activity: activity.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
      counts: {
        needsReply: threadShapes.filter((thread) => thread.needsReply).length,
        pendingApprovals: approvals.filter((approval) => approval.status === "PENDING").length,
        openRequests: requests.filter((request) => OPEN_REQUEST_STATUSES.includes(request.status)).length,
        dueInvoices: dueInvoices.length,
        dueInvoiceTotalCents: dueInvoices.reduce((sum, invoice) => sum + invoice.totalCents, 0),
        claimedPayments: claimedInvoices.length,
        unreadForClient: threadShapes.reduce((sum, thread) => sum + (thread.unreadForClient > 0 ? 1 : 0), 0),
      },
    };

    return NextResponse.json(plate);
  } catch (error) {
    console.error("[internal/tenants/[id]] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
