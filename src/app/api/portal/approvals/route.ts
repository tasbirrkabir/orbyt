import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { ApprovalsPayload, ApprovalItem } from "@/lib/portal/types";

/**
 * GET /api/portal/approvals (protected)
 * The approval center: pending items first, then the decision history.
 * Once a version is approved it never silently changes: new versions
 * arrive as new approvals. Contract: 200 ApprovalsPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context): Promise<NextResponse> => {
    const approvals = await db.approval.findMany({
      where: { organizationId: context.organizationId },
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
      include: {
        project: { select: { title: true } },
        deliverable: { select: { title: true } },
      },
    });

    const map = (approval: (typeof approvals)[number]): ApprovalItem => ({
      id: approval.id,
      title: approval.title,
      type: approval.type,
      version: approval.version,
      description: approval.description,
      status: approval.status,
      submittedAt: approval.submittedAt.toISOString(),
      decidedAt: approval.decidedAt?.toISOString() ?? null,
      decisionComment: approval.decisionComment,
      projectId: approval.projectId,
      projectTitle: approval.project?.title ?? null,
      deliverableTitle: approval.deliverable?.title ?? null,
    });

    const payload: ApprovalsPayload = {
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
      pending: approvals.filter((a) => a.status === "PENDING").map(map),
      decided: approvals.filter((a) => a.status !== "PENDING").map(map),
    };

    return NextResponse.json(payload);
  });
}
