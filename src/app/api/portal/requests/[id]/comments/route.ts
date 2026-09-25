import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson, routeId } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";

/**
 * POST /api/portal/requests/[id]/comments (protected, writers only)
 * The client side of the conversation on a request. Identity comes
 * from the session; the request must belong to the caller's
 * organization. Contract: 201 { comment } | 400 | 401 | 403 | 404 | 500.
 */

const commentSchema = z.object({
  body: z.string().trim().min(2).max(2000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(
      async (context) => {
    const id = await routeId(params);
    const input = await readJson(request, commentSchema);

    const parent = await db.request.findFirst({
      where: { id, organizationId: context.organizationId },
      select: { id: true, code: true, status: true, title: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const comment = await db.requestComment.create({
      data: {
        requestId: parent.id,
        authorName: context.name,
        authorRole: "CLIENT",
        body: input.body,
      },
    });
    await db.request.update({
      where: { id: parent.id },
      data: { updatedAt: new Date() },
    });

    await Promise.all([
      recordActivity(context, {
        type: "REQUEST",
        title: `${parent.code}: you replied`,
        actorRole: "CLIENT",
        targetType: "REQUEST",
        targetLabel: parent.code,
        link: `/workspace/requests/${parent.id}`,
      }),
      recordAudit(context, {
        action: "request.comment",
        targetType: "REQUEST",
        targetLabel: parent.code,
        metadata: { commentId: comment.id },
      }),
    ]);

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          authorName: comment.authorName,
          authorRole: comment.authorRole,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  }, { write: true });
}
