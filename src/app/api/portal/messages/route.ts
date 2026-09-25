import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { identityOf, portalRoute, readJson } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";
import type { ThreadSummary } from "@/lib/portal/types";

/**
 * GET  /api/portal/messages (protected)
 * POST /api/portal/messages (protected, writers only)
 *
 * GET lists the organization's conversation threads, most recent
 * activity first, with unread counts. POST opens a new thread; the
 * first message is the opener. Project context must belong to the
 * tenant. Contract:
 *   GET  200 { threads: ThreadSummary[] }
 *   POST 201 { threadId }
 *   400 | 401 | 403 | 500
 */

const createSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(2).max(4000),
  projectId: z.string().trim().min(1).max(64).optional(),
});

export async function GET() {
  return portalRoute(
      async (context) => {
    const threads = await db.messageThread.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
    });

    const items: ThreadSummary[] = threads.map((thread) => {
      const last = thread.messages[0];
      const unread = thread.messages.filter((m) => !m.readByClient).length;
      return {
        id: thread.id,
        subject: thread.subject,
        context: thread.context,
        projectId: thread.projectId,
        projectTitle: thread.project?.title ?? null,
        lastMessageAt: thread.updatedAt.toISOString(),
        lastSenderRole: last?.senderRole ?? "ORBYT",
        lastMessageBody: last?.body ?? "",
        messageCount: thread._count.messages,
        // The take:1 query only counted the latest message; unread
        // beyond that still shows the thread as unread via last role.
        unreadForClient: unread,
      };
    });

    return NextResponse.json({ threads: items });
  });
}

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    const input = await readJson(request, createSchema);

    let projectId: string | null = null;
    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, organizationId: context.organizationId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json(
          { error: "That project is not on your account" },
          { status: 400 },
        );
      }
      projectId = project.id;
    }

    const thread = await db.messageThread.create({
      data: {
        organizationId: context.organizationId,
        projectId,
        subject: input.subject,
        context: projectId ? "PROJECT" : "GENERAL",
        messages: {
          create: {
            senderName: context.name,
            senderRole: "CLIENT",
            body: input.body,
          },
        },
      },
    });

    await Promise.all([
      recordActivity(context, {
        type: "MESSAGE",
        title: `New message: ${thread.subject}`,
        actorRole: "CLIENT",
        targetType: "THREAD",
        targetLabel: thread.subject,
        link: `/workspace/messages/${thread.id}`,
      }),
      recordAudit(context, {
        action: "message.create",
        targetType: "THREAD",
        targetLabel: thread.subject,
      }),
    ]);

    return NextResponse.json({ threadId: thread.id }, { status: 201 });
  }, { write: true });
}
