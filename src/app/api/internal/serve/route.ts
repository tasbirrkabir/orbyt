import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import {
  closeMeeting,
  createApproval,
  createInvoice,
  markInvoicePaid,
  openThread,
  publishDeliverable,
  replyToRequest,
  replyToThread,
  scheduleMeeting,
  setRequestStatus,
  shareFile,
  StaffOpsError,
} from "@/lib/staff-ops";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/internal/serve (staff key required)
 *
 * The ORBYT-side surface for serving a tenant day to day. One keyed
 * endpoint with explicit actions, every call audited:
 *
 *   message.reply      { threadId, body }
 *   thread.open        { organizationId, subject, body, projectId? }
 *   request.reply      { requestId, body }
 *   request.status     { requestId, status }
 *   approval.create    { projectId, title, description?, type?, version? }
 *   deliverable.publish{ projectId, title, detail?, category?, version?, link? }
 *   file.share         { organizationId, projectId?, name, kind?, sizeKb?, note?, category?, link? }
 *   invoice.create     { organizationId, description, dueDate, subtotalCents, taxCents?, currency? }
 *   invoice.markPaid   { invoiceId, method, reference? }
 *   meeting.schedule   { organizationId, projectId?, title, startsAt, durationMins?, agenda? }
 *   meeting.close      { meetingId, notes, decisions? }
 *
 * Contract: 200/201 { ok, ... } | 400 | 401 | 404 | 409 | 429 | 503.
 */

const messageReply = z.object({
  action: z.literal("message.reply"),
  threadId: z.string().min(1),
  body: z.string().trim().min(2).max(4000),
});

const threadOpen = z.object({
  action: z.literal("thread.open"),
  organizationId: z.string().min(1),
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(2).max(4000),
  projectId: z.string().min(1).optional().nullable(),
});

const requestReply = z.object({
  action: z.literal("request.reply"),
  requestId: z.string().min(1),
  body: z.string().trim().min(2).max(4000),
});

const requestStatus = z.object({
  action: z.literal("request.status"),
  requestId: z.string().min(1),
  status: z.enum(["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "COMPLETED", "CLOSED"]),
});

const approvalCreate = z.object({
  action: z.literal("approval.create"),
  projectId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(["DELIVERABLE", "COPY", "CREATIVE", "DOCUMENT"]).optional(),
  version: z.string().trim().max(20).optional(),
});

const deliverablePublish = z.object({
  action: z.literal("deliverable.publish"),
  projectId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  detail: z.string().trim().max(1000).optional(),
  category: z.enum(["STRATEGY", "BRAND", "UX", "DESIGN", "DEVELOPMENT", "MARKETING", "REPORTS", "FINAL", "OTHER"]).optional(),
  version: z.string().trim().max(20).optional(),
  link: z.string().trim().url().max(500).optional().nullable(),
});

const fileShare = z.object({
  action: z.literal("file.share"),
  organizationId: z.string().min(1),
  projectId: z.string().min(1).optional().nullable(),
  name: z.string().trim().min(3).max(200),
  kind: z.string().trim().max(20).optional(),
  sizeKb: z.number().int().min(0).max(10_000_000).optional(),
  note: z.string().trim().max(500).optional(),
  category: z.enum(["STRATEGY", "BRAND", "UX", "DESIGN", "DEVELOPMENT", "MARKETING", "REPORTS", "FINAL", "OTHER"]).optional(),
  link: z.string().trim().url().max(500).optional().nullable(),
});

const invoiceCreate = z.object({
  action: z.literal("invoice.create"),
  organizationId: z.string().min(1),
  description: z.string().trim().min(3).max(300),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()),
  subtotalCents: z.number().int().min(0),
  taxCents: z.number().int().min(0).optional(),
  currency: z.enum(["BDT", "USD"]).optional(),
});

const invoiceMarkPaid = z.object({
  action: z.literal("invoice.markPaid"),
  invoiceId: z.string().min(1),
  method: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"]),
  reference: z.string().trim().max(120).optional(),
});

const meetingSchedule = z.object({
  action: z.literal("meeting.schedule"),
  organizationId: z.string().min(1),
  projectId: z.string().min(1).optional().nullable(),
  title: z.string().trim().min(3).max(160),
  startsAt: z.string().datetime({ offset: true }),
  durationMins: z.number().int().min(15).max(480).optional(),
  agenda: z.string().trim().max(2000).optional(),
});

const meetingClose = z.object({
  action: z.literal("meeting.close"),
  meetingId: z.string().min(1),
  notes: z.string().trim().min(2).max(4000),
  decisions: z.string().trim().max(2000).optional(),
});

const bodySchema = z.discriminatedUnion("action", [
  messageReply,
  threadOpen,
  requestReply,
  requestStatus,
  approvalCreate,
  deliverablePublish,
  fileShare,
  invoiceCreate,
  invoiceMarkPaid,
  meetingSchedule,
  meetingClose,
]);

function resolveDueDate(raw: string): Date {
  // Accept a full ISO timestamp or a plain date; a plain date is due
  // at the end of that day in UTC, which is the honest reading of a
  // date-only input.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T23:59:59.999Z`);
  }
  return new Date(raw);
}

export async function POST(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    let response: Record<string, unknown> = { ok: true };
    let created = false;

    switch (input.action) {
      case "message.reply": {
        const message = await replyToThread(input.threadId, input.body, "ORBYT crew");
        response = { ok: true, id: message.id };
        break;
      }
      case "thread.open": {
        const thread = await openThread({
          organizationId: input.organizationId,
          subject: input.subject,
          body: input.body,
          projectId: input.projectId ?? null,
          senderName: "ORBYT crew",
        });
        response = { ok: true, id: thread.id };
        created = true;
        break;
      }
      case "request.reply": {
        const result = await replyToRequest(input.requestId, input.body, "ORBYT crew");
        response = { ok: true, id: result.comment.id, transitionedToReviewing: result.transitioned };
        break;
      }
      case "request.status": {
        const updated = await setRequestStatus(input.requestId, input.status);
        response = { ok: true, status: updated.status };
        break;
      }
      case "approval.create": {
        const approval = await createApproval({
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          type: input.type,
          version: input.version,
        });
        response = { ok: true, id: approval.id };
        created = true;
        break;
      }
      case "deliverable.publish": {
        const deliverable = await publishDeliverable({
          projectId: input.projectId,
          title: input.title,
          detail: input.detail,
          category: input.category,
          version: input.version,
          link: input.link ?? null,
        });
        response = { ok: true, id: deliverable.id };
        created = true;
        break;
      }
      case "file.share": {
        const file = await shareFile({
          organizationId: input.organizationId,
          projectId: input.projectId ?? null,
          name: input.name,
          kind: input.kind,
          sizeKb: input.sizeKb,
          note: input.note,
          category: input.category,
          link: input.link ?? null,
        });
        response = { ok: true, id: file.id };
        created = true;
        break;
      }
      case "invoice.create": {
        const invoice = await createInvoice({
          organizationId: input.organizationId,
          description: input.description,
          dueDate: resolveDueDate(input.dueDate),
          subtotalCents: input.subtotalCents,
          taxCents: input.taxCents,
          currency: input.currency,
        });
        response = { ok: true, id: invoice.id, number: invoice.number, totalCents: invoice.totalCents };
        created = true;
        break;
      }
      case "invoice.markPaid": {
        const invoice = await markInvoicePaid(input.invoiceId, input.method, input.reference);
        response = { ok: true, status: invoice.status, paidAt: invoice.paidAt };
        break;
      }
      case "meeting.schedule": {
        const meeting = await scheduleMeeting({
          organizationId: input.organizationId,
          projectId: input.projectId ?? null,
          title: input.title,
          startsAt: new Date(input.startsAt),
          durationMins: input.durationMins,
          agenda: input.agenda,
        });
        response = { ok: true, id: meeting.id };
        created = true;
        break;
      }
      case "meeting.close": {
        await closeMeeting(input.meetingId, input.notes, input.decisions);
        break;
      }
    }

    void recordAuditRaw({
      actorEmail: "staff:internal-api",
      actorRole: "STAFF",
      action: `serve.${input.action}`,
      targetType: "SERVE_OPS",
      targetLabel:
        "threadId" in input ? input.threadId
        : "requestId" in input ? input.requestId
        : "invoiceId" in input ? input.invoiceId
        : "meetingId" in input ? input.meetingId
        : "projectId" in input ? (input.projectId ?? "")
        : "organizationId" in input ? input.organizationId
        : "",
      metadata: { action: input.action },
    });

    return NextResponse.json(response, { status: created ? 201 : 200 });
  } catch (error) {
    if (error instanceof StaffOpsError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[internal/serve] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
