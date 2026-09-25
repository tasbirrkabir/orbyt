import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { identityOf, portalRoute, readJson, routeId } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";
import type { ThreadDetailPayload } from "@/lib/portal/types";

/**
 * GET  /api/portal/messages/[id] (protected)
 * POST /api/portal/messages/[id] (protected, writers only)
 *
 * GET returns the thread and its messages, marking ORBYT messages as
 * read (a fetch is a read). POST appends the client's reply. The
 * thread is org-scoped; a foreign thread id is a 404.
 * Contract: GET 200 ThreadDetailPayload | POST 201 { message } | 404.
 */

const replySchema = z.object({
  body: z.string().trim().min(2).max(4000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(
      async (context) => {
    const { id } = await params;

    const thread = await db.messageThread.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        project: { select: { title: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Reading is receiving: mark inbound messages read.
    await db.message.updateMany({
      where: { threadId: thread.id, senderRole: "ORBYT", readByClient: false },
      data: { readByClient: true },
    });

    const payload: ThreadDetailPayload = {
      identity: identityOf(context),
      thread: {
        id: thread.id,
        subject: thread.subject,
        context: thread.context,
        projectId: thread.projectId,
        projectTitle: thread.project?.title ?? null,
      },
      messages: thread.messages.map((message) => ({
        id: message.id,
        senderName: message.senderName,
        senderRole: message.senderRole,
        body: message.body,
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
  return portalRoute(async (context) => {
    const { id } = await params;
    const input = await readJson(request, replySchema);

    const thread = await db.messageThread.findFirst({
      where: { id, organizationId: context.organizationId },
      select: { id: true, subject: true },
    });
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const message = await db.message.create({
      data: {
        threadId: thread.id,
        senderName: context.name,
        senderRole: "CLIENT",
        body: input.body,
      },
    });
    await db.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    await Promise.all([
      recordActivity(context, {
        type: "MESSAGE",
        title: `Reply sent on ${thread.subject}`,
        actorRole: "CLIENT",
        targetType: "THREAD",
        targetLabel: thread.subject,
        link: `/workspace/messages/${thread.id}`,
      }),
      recordAudit(context, {
        action: "message.reply",
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
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  }, { write: true });
}
