import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { CATEGORY_LABELS, REQUEST_CATEGORIES, REQUEST_PRIORITIES } from "@/lib/portal/domain";
import { nextCode, recordActivity, recordAudit, recordNotification } from "@/lib/portal/records";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import type { RequestItem } from "@/lib/portal/types";

/**
 * GET  /api/portal/requests (protected)
 * POST /api/portal/requests (protected, writers only)
 *
 * GET lists the organization's requests, newest activity first.
 * POST files a new request: zod-validated, org-scoped code, requester
 * identity taken from the session (never the body), activity + audit
 * + a notification for the desk. Contract:
 *   GET  200 { requests: RequestItem[] }
 *   POST 201 { request: RequestItem }
 *   400 invalid input | 401 | 403 read-only seat | 429 | 500
 */

const createSchema = z.object({
  title: z.string().trim().min(4).max(120),
  category: z.enum(REQUEST_CATEGORIES).default("OTHER"),
  priority: z.enum(REQUEST_PRIORITIES).default("NORMAL"),
  description: z.string().trim().min(10).max(4000),
  projectId: z.string().trim().min(1).max(64).optional(),
});

function mapRequest(request: {
  id: string;
  code: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  requesterName: string;
  projectId: string | null;
  project?: { title: string } | null;
  _count?: { comments: number };
  createdAt: Date;
  updatedAt: Date;
}): RequestItem {
  return {
    id: request.id,
    code: request.code,
    title: request.title,
    category: request.category,
    priority: request.priority,
    status: request.status,
    description: request.description,
    requesterName: request.requesterName,
    projectId: request.projectId,
    projectTitle: request.project?.title ?? null,
    commentCount: request._count?.comments ?? 0,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export async function GET() {
  return portalRoute(async (context) => {
    const requests = await db.request.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { title: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json({ requests: requests.map(mapRequest) });
  });
}

// Shared limiter (src/lib/rate-limit.ts): max 5 per 10 minutes per IP + user.

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    if (!checkRateLimit("request-file", `${clientIp(request)}:${context.userId}`, 5, 10 * 60 * 1000).ok) {
      return NextResponse.json(
        { error: "Too many requests in a row. Give it a few minutes." },
        { status: 429 },
      );
    }

    const input = await readJson(request, createSchema);

    // Project context must belong to this organization, or it does not exist.
    let projectId: string | null = null;
    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, organizationId: context.organizationId },
        select: { id: true },
      });
      if (!project) {
        throw new z.ZodError([
          { code: "custom", path: ["projectId"], message: "That project is not on your account" },
        ]);
      }
      projectId = project.id;
    }

    const code = await nextCode(context.organizationId, "REQ");
    const created = await db.request.create({
      data: {
        organizationId: context.organizationId,
        projectId,
        code,
        requesterId: context.userId,
        requesterName: context.name,
        title: input.title,
        category: input.category,
        priority: input.priority,
        status: "SUBMITTED",
        description: input.description,
      },
      include: { project: { select: { title: true } }, _count: { select: { comments: true } } },
    });

    await Promise.all([
      recordActivity(context, {
        type: "REQUEST",
        title: `${created.code} submitted: ${created.title}`,
        actorRole: "CLIENT",
        targetType: "REQUEST",
        targetLabel: created.code,
        link: `/workspace/requests/${created.id}`,
      }),
      recordAudit(context, {
        action: "request.create",
        targetType: "REQUEST",
        targetLabel: created.code,
        metadata: { category: created.category, priority: created.priority },
      }),
      recordNotification(context, {
        type: "REQUEST",
        title: `Request ${created.code} received`,
        body: `${CATEGORY_LABELS[created.category] ?? "General"}: ${created.title}. The desk replies within one business day.`,
        link: `/workspace/requests/${created.id}`,
      }),
    ]);

    return NextResponse.json({ request: mapRequest(created) }, { status: 201 });
  }, { write: true });
}
