import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import type { AdminThreadItem, AdminThreadsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/messages (staff only)
 * POST /api/admin/messages (staff only)
 *
 * GET lists every thread across tenants, threads with an unread client
 * message surface first in the overview queue. POST opens a thread to
 * a client with the desk's first message on record.
 *   GET  200 { threads: AdminThreadItem[] }
 *   POST 201 { thread: AdminThreadItem }
 */

const CONTEXTS = ["PROJECT", "REQUEST", "APPROVAL", "DELIVERABLE", "MEETING", "GENERAL"] as const;

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1).optional().nullable(),
  subject: z.string().trim().min(3).max(160),
  context: z.enum(CONTEXTS).default("GENERAL"),
  body: z.string().trim().min(2).max(4000),
});

export async function GET() {
  return adminRoute(async () => {
    const threads = await db.messageThread.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
    });

    const unreadCounts = await db.message.groupBy({
      by: ["threadId"],
      where: { senderRole: "CLIENT", readByClient: false },
      _count: { _all: true },
    });
    const unreadByThread = new Map(unreadCounts.map((row) => [row.threadId, row._count._all]));

    const payload: AdminThreadsPayload = {
      threads: threads.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        projectId: row.projectId,
        projectTitle: row.project?.title ?? null,
        subject: row.subject,
        context: row.context,
        messageCount: row._count.messages,
        lastSenderRole: row.messages[0]?.senderRole ?? "CLIENT",
        lastMessageBody: row.messages[0]?.body ?? "",
        unreadForClient: unreadByThread.get(row.id) ?? 0,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const org = await db.organization.findUnique({ where: { id: input.organizationId } });
    if (!org) {
      throw new z.ZodError([
        { code: "custom", path: ["organizationId"], message: "That client does not exist" },
      ]);
    }
    let projectId: string | null = null;
    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, organizationId: org.id },
        select: { id: true },
      });
      if (!project) {
        throw new z.ZodError([
          { code: "custom", path: ["projectId"], message: "That project is not on this client" },
        ]);
      }
      projectId = project.id;
    }

    const thread = await db.messageThread.create({
      data: {
        organizationId: org.id,
        projectId,
        subject: input.subject,
        context: input.context,
        messages: {
          create: {
            senderName: context.name,
            senderRole: "ORBYT",
            body: input.body,
            readByClient: false,
          },
        },
      },
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "MESSAGE",
        title: `New conversation: ${thread.subject}`,
        targetType: "MESSAGE",
        targetLabel: thread.subject,
        link: "/workspace/messages",
      }),
      recordStaffNotification(context, {
        organizationId: org.id,
        type: "MESSAGE",
        title: `New message from the desk: ${thread.subject}`,
        body: input.body.slice(0, 160),
        link: `/workspace/messages/${thread.id}`,
      }),
      recordStaffAudit(context, {
        action: "thread.create",
        organizationId: org.id,
        targetType: "THREAD",
        targetLabel: thread.subject,
      }),
    ]);

    const item: AdminThreadItem = {
      id: thread.id,
      organizationId: thread.organizationId,
      organizationName: thread.organization.name,
      clientId: thread.organization.clientId,
      projectId: thread.projectId,
      projectTitle: thread.project?.title ?? null,
      subject: thread.subject,
      context: thread.context,
      messageCount: thread._count.messages,
      lastSenderRole: thread.messages[0]?.senderRole ?? "ORBYT",
      lastMessageBody: thread.messages[0]?.body ?? "",
      unreadForClient: 1,
      updatedAt: thread.updatedAt.toISOString(),
    };
    return NextResponse.json({ thread: item }, { status: 201 });
  });
}
