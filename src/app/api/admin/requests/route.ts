import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminRoute } from "@/lib/admin/api";
import type { AdminRequestsPayload } from "@/lib/admin/types";

/**
 * GET /api/admin/requests (staff only)
 *
 * The full request queue across tenants, newest activity first, with
 * the whole comment thread inline so the desk answers in one read.
 * 200 AdminRequestsPayload | 401
 */
export async function GET() {
  return adminRoute(async () => {
    const requests = await db.request.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
        comments: { orderBy: { createdAt: "asc" } },
      },
    });

    const payload: AdminRequestsPayload = {
      requests: requests.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        code: row.code,
        title: row.title,
        category: row.category,
        priority: row.priority,
        status: row.status,
        description: row.description,
        requesterName: row.requesterName,
        projectId: row.projectId,
        projectTitle: row.project?.title ?? null,
        comments: row.comments.map((comment) => ({
          id: comment.id,
          authorName: comment.authorName,
          authorRole: comment.authorRole,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
        })),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
    return NextResponse.json(payload);
  });
}
