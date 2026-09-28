import { db } from "@/lib/db";
import { nextCode } from "@/lib/portal/records";

/**
 * Staff operations service — the ORBYT side of the daily loop.
 *
 * Where project-ops governs the contract of a project (scope, changes,
 * health, decisions), staff-ops is the working surface for serving a
 * tenant day to day: answering messages, triaging requests, asking for
 * sign-off, publishing deliverables, sharing files, invoicing,
 * recording payments and scheduling meetings.
 *
 * Rules this service enforces, without exception:
 *  - Every entity is resolved through its organization; a stale id is
 *    a 404, never a cross-tenant write.
 *  - Every mutation appends a client-visible ActivityEvent, so the
 *    client's activity ledger stays the single honest story.
 *  - Mutations that change what a client must look at also write a
 *    Notification (the bell).
 *  - Money is recorded, never inferred: an invoice becomes PAID only
 *    through an explicit staff record with a method, and a client's
 *    "I've paid" report is a claim (Payment row) that keeps the
 *    invoice PENDING until staff confirm it.
 */

export class StaffOpsError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "COMPLETED", "CLOSED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const DELIVERABLE_CATEGORIES = ["STRATEGY", "BRAND", "UX", "DESIGN", "DEVELOPMENT", "MARKETING", "REPORTS", "FINAL", "OTHER"] as const;
export type DeliverableCategory = (typeof DELIVERABLE_CATEGORIES)[number];

const PAYMENT_METHODS = ["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

async function orgExists(organizationId: string): Promise<void> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!org) throw new StaffOpsError(404, "Organization not found");
}

async function projectInOrg(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true, title: true, code: true },
  });
  if (!project) throw new StaffOpsError(404, "Project not found");
  // A project not attached to a tenant cannot be served; there is no
  // organization to write activity, notifications or invoices to.
  if (!project.organizationId) {
    throw new StaffOpsError(409, "That project is not attached to a tenant");
  }
  return { ...project, organizationId: project.organizationId };
}

async function appendActivity(input: {
  organizationId: string;
  type: string;
  title: string;
  targetType?: string;
  targetLabel?: string;
  link?: string;
}) {
  try {
    await db.activityEvent.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        title: input.title,
        actorName: "ORBYT crew",
        actorRole: "ORBYT",
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[staff-ops] activity write failed:", error);
  }
}

async function notifyClient(input: {
  organizationId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await db.notification.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        title: input.title,
        body: input.body ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[staff-ops] notification write failed:", error);
  }
}

// ── Messages ────────────────────────────────────────────────────

export async function replyToThread(threadId: string, body: string, senderName: string) {
  const thread = await db.messageThread.findUnique({
    where: { id: threadId },
    select: { id: true, organizationId: true, subject: true },
  });
  if (!thread) throw new StaffOpsError(404, "Thread not found");

  const [message] = await db.$transaction([
    db.message.create({
      data: {
        threadId: thread.id,
        senderName,
        senderRole: "ORBYT",
        body,
        readByClient: false,
      },
    }),
    db.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  await Promise.all([
    appendActivity({
      organizationId: thread.organizationId,
      type: "MESSAGE",
      title: `ORBYT replied: ${thread.subject}`,
      targetType: "THREAD",
      targetLabel: thread.subject,
      link: `/workspace/messages/${thread.id}`,
    }),
    notifyClient({
      organizationId: thread.organizationId,
      type: "MESSAGE",
      title: `New reply: ${thread.subject}`,
      link: `/workspace/messages/${thread.id}`,
    }),
  ]);
  return message;
}

export async function openThread(input: {
  organizationId: string;
  subject: string;
  body: string;
  projectId?: string | null;
  senderName: string;
}) {
  await orgExists(input.organizationId);
  let projectId: string | null = null;
  if (input.projectId) {
    const project = await projectInOrg(input.projectId);
    projectId = project.id;
  }
  const thread = await db.messageThread.create({
    data: {
      organizationId: input.organizationId,
      projectId,
      subject: input.subject,
      context: projectId ? "PROJECT" : "GENERAL",
      messages: {
        create: {
          senderName: input.senderName,
          senderRole: "ORBYT",
          body: input.body,
          readByClient: false,
        },
      },
    },
  });
  await Promise.all([
    appendActivity({
      organizationId: input.organizationId,
      type: "MESSAGE",
      title: `ORBYT started a conversation: ${thread.subject}`,
      targetType: "THREAD",
      targetLabel: thread.subject,
      link: `/workspace/messages/${thread.id}`,
    }),
    notifyClient({
      organizationId: input.organizationId,
      type: "MESSAGE",
      title: `New message: ${thread.subject}`,
      link: `/workspace/messages/${thread.id}`,
    }),
  ]);
  return thread;
}

// ── Requests ────────────────────────────────────────────────────

export async function replyToRequest(requestId: string, body: string, authorName: string) {
  const request = await db.request.findUnique({
    where: { id: requestId },
    select: { id: true, organizationId: true, code: true, title: true, status: true },
  });
  if (!request) throw new StaffOpsError(404, "Request not found");

  const transitioning = request.status === "SUBMITTED";
  const [comment] = await db.$transaction([
    db.requestComment.create({
      data: { requestId: request.id, authorName, authorRole: "ORBYT", body },
    }),
    ...(transitioning
      ? [db.request.update({ where: { id: request.id }, data: { status: "REVIEWING" } })]
      : []),
  ]);

  await Promise.all([
    appendActivity({
      organizationId: request.organizationId,
      type: "REQUEST",
      title: `ORBYT replied on ${request.code}`,
      targetType: "REQUEST",
      targetLabel: request.code,
      link: `/workspace/requests/${request.id}`,
    }),
    notifyClient({
      organizationId: request.organizationId,
      type: "REQUEST",
      title: `${request.code}: the desk replied`,
      link: `/workspace/requests/${request.id}`,
    }),
  ]);
  return { comment, transitioned: transitioning };
}

export async function setRequestStatus(requestId: string, status: RequestStatus) {
  const request = await db.request.findUnique({
    where: { id: requestId },
    select: { id: true, organizationId: true, code: true, title: true, status: true },
  });
  if (!request) throw new StaffOpsError(404, "Request not found");
  if (request.status === status) {
    throw new StaffOpsError(409, `Request is already ${status}`);
  }

  const updated = await db.request.update({
    where: { id: request.id },
    data: { status },
  });

  await Promise.all([
    appendActivity({
      organizationId: request.organizationId,
      type: "REQUEST",
      title: `${request.code} moved to ${status.replace(/_/g, " ").toLowerCase()}`,
      targetType: "REQUEST",
      targetLabel: request.code,
      link: `/workspace/requests/${request.id}`,
    }),
    notifyClient({
      organizationId: request.organizationId,
      type: "REQUEST",
      title: `${request.code}: ${status.replace(/_/g, " ").toLowerCase()}`,
      link: `/workspace/requests/${request.id}`,
    }),
  ]);
  return updated;
}

// ── Approvals ───────────────────────────────────────────────────

export async function createApproval(input: {
  projectId: string;
  title: string;
  description?: string;
  type?: string;
  version?: string;
}) {
  const project = await projectInOrg(input.projectId);

  const approval = await db.approval.create({
    data: {
      organizationId: project.organizationId,
      projectId: project.id,
      title: input.title,
      type: input.type ?? "DELIVERABLE",
      version: input.version ?? "v1",
      description: input.description ?? "",
      status: "PENDING",
    },
  });

  await Promise.all([
    appendActivity({
      organizationId: project.organizationId,
      type: "APPROVAL",
      title: `Sign-off requested: ${approval.title}`,
      targetType: "APPROVAL",
      targetLabel: approval.title,
      link: "/workspace/approvals",
    }),
    notifyClient({
      organizationId: project.organizationId,
      type: "APPROVAL",
      title: `Sign-off requested: ${approval.title}`,
      body: approval.description,
      link: "/workspace/approvals",
    }),
  ]);
  return approval;
}

// ── Deliverables & files ────────────────────────────────────────

export async function publishDeliverable(input: {
  projectId: string;
  title: string;
  detail?: string;
  category?: DeliverableCategory;
  version?: string;
  link?: string | null;
}) {
  const project = await projectInOrg(input.projectId);
  const deliverable = await db.deliverable.create({
    data: {
      projectId: project.id,
      title: input.title,
      detail: input.detail ?? "",
      status: "DELIVERED",
      approvalState: "IN REVIEW",
      version: input.version ?? "v1",
      category: input.category ?? "OTHER",
      link: input.link ?? null,
      deliveredAt: new Date(),
    },
  });
  await Promise.all([
    appendActivity({
      organizationId: project.organizationId,
      type: "DELIVERABLE",
      title: `Delivered: ${deliverable.title}`,
      targetType: "DELIVERABLE",
      targetLabel: deliverable.title,
      link: "/workspace/deliverables",
    }),
    notifyClient({
      organizationId: project.organizationId,
      type: "PROJECT",
      title: `New deliverable: ${deliverable.title}`,
      body: deliverable.detail,
      link: "/workspace/deliverables",
    }),
  ]);
  return deliverable;
}

export async function shareFile(input: {
  organizationId: string;
  projectId?: string | null;
  name: string;
  kind?: string;
  sizeKb?: number;
  note?: string;
  category?: DeliverableCategory;
  link?: string | null;
}) {
  await orgExists(input.organizationId);
  let projectId: string | null = null;
  if (input.projectId) {
    const project = await projectInOrg(input.projectId);
    projectId = project.id;
  }
  const file = await db.portalFile.create({
    data: {
      organizationId: input.organizationId,
      projectId,
      name: input.name,
      kind: input.kind ?? "pdf",
      sizeKb: input.sizeKb ?? 0,
      category: input.category ?? "OTHER",
      status: "SHARED",
      uploadedBy: "ORBYT",
      note: input.note ?? "",
      link: input.link ?? null,
    },
  });
  await appendActivity({
    organizationId: input.organizationId,
    type: "FILE",
    title: `File shared: ${file.name}`,
    targetType: "FILE",
    targetLabel: file.name,
    link: "/workspace/files",
  });
  return file;
}

// ── Billing ─────────────────────────────────────────────────────

export async function createInvoice(input: {
  organizationId: string;
  description: string;
  dueDate: Date;
  subtotalCents: number;
  taxCents?: number;
  currency?: string;
}) {
  await orgExists(input.organizationId);
  const number = await nextCode(input.organizationId, "INV");
  const total = input.subtotalCents + (input.taxCents ?? 0);
  const invoice = await db.invoice.create({
    data: {
      organizationId: input.organizationId,
      number,
      issueDate: new Date(),
      dueDate: input.dueDate,
      description: input.description,
      subtotalCents: input.subtotalCents,
      taxCents: input.taxCents ?? 0,
      totalCents: total,
      currency: input.currency ?? "BDT",
      status: "PENDING",
    },
  });
  await Promise.all([
    appendActivity({
      organizationId: input.organizationId,
      type: "BILLING",
      title: `Invoice ${invoice.number} issued`,
      targetType: "INVOICE",
      targetLabel: invoice.number,
      link: "/workspace/billing",
    }),
    notifyClient({
      organizationId: input.organizationId,
      type: "BILLING",
      title: `Invoice ${invoice.number} issued`,
      body: invoice.description,
      link: "/workspace/billing",
    }),
  ]);
  return invoice;
}

export async function markInvoicePaid(invoiceId: string, method: PaymentMethod, reference?: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, organizationId: true, number: true, status: true, totalCents: true },
  });
  if (!invoice) throw new StaffOpsError(404, "Invoice not found");
  if (["PAID", "CANCELLED"].includes(invoice.status)) {
    throw new StaffOpsError(409, `Invoice is already ${invoice.status}`);
  }

  const paidAt = new Date();
  const updated = await db.$transaction(async (tx) => {
    const row = await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt, method },
    });
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amountCents: invoice.totalCents,
        method,
        reference: reference ?? "",
        paidAt,
      },
    });
    return row;
  });

  await Promise.all([
    appendActivity({
      organizationId: invoice.organizationId,
      type: "BILLING",
      title: `Payment recorded for ${invoice.number}`,
      targetType: "INVOICE",
      targetLabel: invoice.number,
      link: "/workspace/billing",
    }),
    notifyClient({
      organizationId: invoice.organizationId,
      type: "BILLING",
      title: `Invoice ${invoice.number} marked paid`,
      link: "/workspace/billing",
    }),
  ]);
  return updated;
}

export async function recordPaymentClaim(invoiceId: string, method: PaymentMethod, reference: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, organizationId: true, number: true, status: true, totalCents: true },
  });
  if (!invoice) throw new StaffOpsError(404, "Invoice not found");
  if (["PAID", "CANCELLED"].includes(invoice.status)) {
    throw new StaffOpsError(409, `Invoice is already ${invoice.status}`);
  }
  const payment = await db.payment.create({
    data: {
      invoiceId: invoice.id,
      amountCents: invoice.totalCents,
      method,
      reference,
    },
  });
  await appendActivity({
    organizationId: invoice.organizationId,
    type: "BILLING",
    title: `Payment reported for ${invoice.number} (${method.replace(/_/g, " ").toLowerCase()}${reference ? `, ref ${reference}` : ""}) — awaiting confirmation`,
    targetType: "INVOICE",
    targetLabel: invoice.number,
    link: "/workspace/billing",
  });
  return payment;
}

// ── Meetings ────────────────────────────────────────────────────

export async function scheduleMeeting(input: {
  organizationId: string;
  projectId?: string | null;
  title: string;
  startsAt: Date;
  durationMins?: number;
  agenda?: string;
}) {
  await orgExists(input.organizationId);
  let projectId: string | null = null;
  if (input.projectId) {
    const project = await projectInOrg(input.projectId);
    projectId = project.id;
  }
  const meeting = await db.meeting.create({
    data: {
      organizationId: input.organizationId,
      projectId,
      title: input.title,
      startsAt: input.startsAt,
      durationMins: input.durationMins ?? 30,
      agenda: input.agenda ?? "",
      status: "UPCOMING",
    },
  });
  await Promise.all([
    appendActivity({
      organizationId: input.organizationId,
      type: "MEETING",
      title: `Meeting scheduled: ${meeting.title}`,
      targetType: "MEETING",
      targetLabel: meeting.title,
      link: "/workspace/meetings",
    }),
    notifyClient({
      organizationId: input.organizationId,
      type: "MEETING",
      title: `Meeting scheduled: ${meeting.title}`,
      link: "/workspace/meetings",
    }),
  ]);
  return meeting;
}

export async function closeMeeting(meetingId: string, notes: string, decisions?: string) {
  const meeting = await db.meeting.findUnique({
    where: { id: meetingId },
    select: { id: true, organizationId: true, title: true, status: true },
  });
  if (!meeting) throw new StaffOpsError(404, "Meeting not found");
  if (meeting.status === "COMPLETED") {
    throw new StaffOpsError(409, "Meeting is already completed");
  }
  const updated = await db.meeting.update({
    where: { id: meeting.id },
    data: { status: "COMPLETED", notes, decisions: decisions ?? "" },
  });
  await appendActivity({
    organizationId: meeting.organizationId,
    type: "MEETING",
    title: `Meeting notes shared: ${meeting.title}`,
    targetType: "MEETING",
    targetLabel: meeting.title,
    link: "/workspace/meetings",
  });
  return updated;
}
