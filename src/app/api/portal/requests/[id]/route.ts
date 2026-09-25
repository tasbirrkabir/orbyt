import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { RequestDetailPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/requests/[id] (protected)
 * One request with its full comment thread. Scoped by organizationId:
 * another tenant's request code is a 404, never a leak.
 * Contract: 200 RequestDetailPayload | 401 | 404 | 500.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const { id } = await params;

    const request = await db.request.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        project: { select: { title: true } },
        comments: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload: RequestDetailPayload = {
      identity: {
        name: context.name,
        email: context.email,
        organizationName: context.organizationName,
        clientId: context.clientId,
        tier: context.tier,
        role: context.role,
        canWrite: context.canWrite,
        modules: identityOf(context).modules,
      },
      request: {
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
        commentCount: request.comments.length,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      },
      comments: request.comments.map((comment) => ({
        id: comment.id,
        authorName: comment.authorName,
        authorRole: comment.authorRole,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(payload);
  });
}
