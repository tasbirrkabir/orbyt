import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";

/**
 * POST /api/admin/requests/[id]/comments (staff only)
 *
 * The desk reply, on the record. Author identity comes from the staff
 * session, never the body. Moves SUBMITTED requests to REVIEWING so
 * the queue reflects that someone picked it up.
 * 201 { comment } | 400 | 404
 */

const createSchema = z.object({
  body: z.string().trim().min(2).max(4000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const row = await db.request.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comment = await db.requestComment.create({
      data: {
        requestId: id,
        authorName: context.name,
        authorRole: "ORBYT",
        body: input.body,
      },
    });
    if (row.status === "SUBMITTED") {
      await db.request.update({ where: { id }, data: { status: "REVIEWING" } });
    }

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: row.organizationId,
        type: "REQUEST",
        title: `${row.code}: the desk replied`,
        targetType: "REQUEST",
        targetLabel: row.code,
        link: `/workspace/requests/${row.id}`,
      }),
      recordStaffNotification(context, {
        organizationId: row.organizationId,
        type: "REQUEST",
        title: `Reply on ${row.code}: ${row.title}`,
        body: input.body.slice(0, 160),
        link: `/workspace/requests/${row.id}`,
      }),
      recordStaffAudit(context, {
        action: "request.reply",
        organizationId: row.organizationId,
        targetType: "REQUEST",
        targetLabel: row.code,
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
        status: row.status === "SUBMITTED" ? "REVIEWING" : row.status,
      },
      { status: 201 },
    );
  });
}
