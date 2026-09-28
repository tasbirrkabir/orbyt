import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminRoute } from "@/lib/admin/api";
import type { AdminApprovalsPayload } from "@/lib/admin/types";

/**
 * GET /api/admin/approvals (staff only)
 *
 * Every sign-off across tenants, waiting first. Approvals are client
 * decisions; the desk reads them here and never decides for the client.
 * 200 AdminApprovalsPayload | 401
 */
export async function GET() {
  return adminRoute(async () => {
    const approvals = await db.approval.findMany({
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
        deliverable: { select: { id: true, title: true } },
      },
    });

    const payload: AdminApprovalsPayload = {
      approvals: approvals.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        projectId: row.projectId,
        projectTitle: row.project?.title ?? null,
        deliverableId: row.deliverableId,
        deliverableTitle: row.deliverable?.title ?? null,
        title: row.title,
        type: row.type,
        version: row.version,
        description: row.description,
        status: row.status,
        submittedAt: row.submittedAt.toISOString(),
        decidedAt: row.decidedAt?.toISOString() ?? null,
        decisionComment: row.decisionComment,
      })),
    };
    return NextResponse.json(payload);
  });
}
