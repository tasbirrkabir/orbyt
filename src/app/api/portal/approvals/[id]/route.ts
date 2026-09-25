import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { identityOf, portalRoute, readJson, routeId } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";
import type { ApprovalItem } from "@/lib/portal/types";

/**
 * POST /api/portal/approvals/[id] (protected, writers only)
 * The decision endpoint. APPROVE records who decided, when, at which
 * version, and the optional comment. REQUEST_CHANGES requires a
 * comment. Decisions are final records, not toggles: a second POST on
 * a decided approval is a 409, never a silent flip. Viewers are
 * rejected upstream by the writer guard.
 *
 * Contract: 200 { approval } | 400 | 401 | 403 | 404 | 409 | 500.
 */

const decisionSchema = z
  .object({
    decision: z.enum(["APPROVE", "REQUEST_CHANGES"]),
    comment: z.string().trim().max(1000).default(""),
  })
  .refine(
    (input) => input.decision === "APPROVE" || input.comment.length >= 4,
    { message: "A comment is required to request changes", path: ["comment"] },
  );

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(
      async (context) => {
    const id = await routeId(params);
    const input = await readJson(request, decisionSchema);

    const approval = await db.approval.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        project: { select: { id: true, title: true } },
        deliverable: { select: { id: true, title: true } },
      },
    });
    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: "This decision is already on record." },
        { status: 409 },
      );
    }

    const approved = input.decision === "APPROVE";

    // One-way record with full attribution. Approved versions also
    // mark their linked deliverable, so the index stays truthful.
    const updated = await db.$transaction(async (tx) => {
      const row = await tx.approval.update({
        where: { id: approval.id },
        data: {
          status: approved ? "APPROVED" : "CHANGES_REQUESTED",
          decidedAt: new Date(),
          decidedById: context.userId,
          decisionComment: input.comment,
        },
      });
      if (approved && approval.deliverableId) {
        await tx.deliverable.update({
          where: { id: approval.deliverableId },
          data: { approvalState: "APPROVED" },
        });
      }
      return row;
    });

    const title = approved
      ? `${updated.title} ${updated.version} approved`
      : `Changes requested on ${updated.title} ${updated.version}`;

    await Promise.all([
      recordActivity(context, {
        type: "APPROVAL",
        title,
        actorRole: "CLIENT",
        targetType: "APPROVAL",
        targetLabel: updated.title,
        link: "/workspace/approvals",
      }),
      recordAudit(context, {
        action: approved ? "approval.approve" : "approval.changes_requested",
        targetType: "APPROVAL",
        targetLabel: `${updated.title} ${updated.version}`,
        metadata: {
          approvalId: updated.id,
          comment: input.comment,
          projectId: approval.projectId,
        },
      }),
    ]);

    const item: ApprovalItem = {
      id: updated.id,
      title: updated.title,
      type: updated.type,
      version: updated.version,
      description: updated.description,
      status: updated.status,
      submittedAt: updated.submittedAt.toISOString(),
      decidedAt: updated.decidedAt?.toISOString() ?? null,
      decisionComment: updated.decisionComment,
      projectId: approval.projectId,
      projectTitle: approval.project?.title ?? null,
      deliverableTitle: approval.deliverable?.title ?? null,
    };

    return NextResponse.json({ identity: identityOf(context), approval: item });
  }, { write: true });
}
