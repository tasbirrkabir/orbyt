import { NextResponse } from "next/server";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { db } from "@/lib/db";

/**
 * GET /api/internal/projects/[id] (staff key required)
 *
 * The full operations picture for one project: identity, recorded
 * health, scope, change requests, the immutable decision log, plus
 * the client-side queues (requests, approvals) staff need to work.
 * Read-only: mutations go through POST /api/internal/project-ops so
 * every write stays audited and consistent.
 *
 * Contract:
 *   200 { ok, project }
 *   401 bad key | 404 unknown id | 429 throttled | 503 not configured
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const project = await db.project.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        title: true,
        stage: true,
        status: true,
        type: true,
        goal: true,
        ownerLabel: true,
        health: true,
        healthNote: true,
        healthUpdatedAt: true,
        startedAt: true,
        targetLaunchAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            clientId: true,
            tier: true,
            users: {
              select: { id: true, name: true, email: true, role: true, activatedAt: true },
            },
          },
        },
        scopeItems: {
          orderBy: [{ position: "asc" }],
          select: {
            id: true, title: true, detail: true, kind: true, status: true, position: true,
          },
        },
        changeRequests: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, code: true, title: true, description: true, impactNote: true,
            raisedBy: true, raisedByName: true, status: true,
            decidedAt: true, decidedByName: true, decidedByRole: true, decisionNote: true,
            createdAt: true,
          },
        },
        decisions: {
          orderBy: { decidedAt: "desc" },
          take: 50,
          select: {
            id: true, title: true, context: true, decidedByRole: true,
            decidedByName: true, sourceType: true, sourceLabel: true, decidedAt: true,
          },
        },
        requests: {
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true, code: true, title: true, status: true, priority: true,
            requesterName: true, updatedAt: true,
          },
        },
        approvals: {
          orderBy: { submittedAt: "desc" },
          take: 10,
          select: {
            id: true, title: true, type: true, version: true, status: true,
            submittedAt: true, decidedAt: true, decisionComment: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("[internal/projects/:id] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
