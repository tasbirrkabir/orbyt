import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import type { AdminThreadDetailPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/messages/[id] (staff only)
 * POST /api/admin/messages/[id] (staff only)
 *
 * GET: the thread with both sides of the exchange. POST: the desk
 * reply, sender from the session. The reply lands unread so the
 * client's portal flags it.
 *   GET  200 AdminThreadDetailPayload | 404
 *   POST 201 { message } | 400 | 404
 */

const createSchema = z.object({
  body: z.string().trim().min(2).max(4000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async () => {
    const thread = await db.messageThread.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const unreadForClient = thread.messages.filter(
      (message) => message.senderRole === "CLIENT" && !message.readByClient,
    ).length;
    const last = thread.messages[thread.messages.length - 1];

    const payload: AdminThreadDetailPayload = {
      thread: {
        id: thread.id,
        organizationId: thread.organizationId,
        organizationName: thread.organization.name,
        clientId: thread.organization.clientId,
        projectId: thread.projectId,
        projectTitle: thread.project?.title ?? null,
        subject: thread.subject,
        context: thread.context,
        messageCount: thread.messages.length,
        lastSenderRole: last?.senderRole ?? "CLIENT",
        lastMessageBody: last?.body ?? "",
        unreadForClient,
        updatedAt: thread.updatedAt.toISOString(),
      },
      messages: thread.messages.map((message) => ({
        id: message.id,
        senderName: message.senderName,
        senderRole: message.senderRole,
        body: message.body,
        readByClient: message.readByClient,
        createdAt: message.createdAt.toISOString(),
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const thread = await db.messageThread.findUnique({ where: { id } });
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const message = await db.message.create({
      data: {
        threadId: id,
        senderName: context.name,
        senderRole: "ORBYT",
        body: input.body,
        readByClient: false,
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: thread.organizationId,
        type: "MESSAGE",
        title: `Reply sent on ${thread.subject}`,
        targetType: "MESSAGE",
        targetLabel: thread.subject,
        link: `/workspace/messages/${thread.id}`,
      }),
      recordStaffNotification(context, {
        organizationId: thread.organizationId,
        type: "MESSAGE",
        title: `The desk replied: ${thread.subject}`,
        body: input.body.slice(0, 160),
        link: `/workspace/messages/${thread.id}`,
      }),
      recordStaffAudit(context, {
        action: "thread.reply",
        organizationId: thread.organizationId,
        targetType: "THREAD",
        targetLabel: thread.subject,
      }),
    ]);

    return NextResponse.json(
      {
        message: {
          id: message.id,
          senderName: message.senderName,
          senderRole: message.senderRole,
          body: message.body,
          readByClient: message.readByClient,
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  });
}
