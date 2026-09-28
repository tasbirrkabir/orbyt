import { NextResponse } from "next/server";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import { db } from "@/lib/db";

/**
 * GET /api/internal/projects (staff key required)
 *
 * Cross-tenant project list for the staff console. This is staff
 * surface: it intentionally spans organizations, guarded by the same
 * bearer key as every other internal endpoint, and every use lands in
 * the audit ledger.
 *
 * Contract:
 *   200 { ok, projects: [{ id, code, title, stage, status, type, health,
 *          healthNote, healthUpdatedAt, targetLaunchAt, updatedAt,
 *          org: { id, name, clientId, tier },
 *          openChangeRequests, pendingApprovals, openRequests }] }
 *   401 bad key | 429 throttled | 503 not configured
 */

const OPEN_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];

export async function GET(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") ?? "100");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200) : 100;

    const projects = await db.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        code: true,
        title: true,
        stage: true,
        status: true,
        type: true,
        health: true,
        healthNote: true,
        healthUpdatedAt: true,
        targetLaunchAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true, clientId: true, tier: true },
        },
        _count: {
          select: {
            changeRequests: { where: { status: "PROPOSED" } },
            approvals: { where: { status: "PENDING" } },
            requests: { where: { status: { in: OPEN_REQUEST_STATUSES } } },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      projects: projects.map((project) => ({
        id: project.id,
        code: project.code,
        title: project.title,
        stage: project.stage,
        status: project.status,
        type: project.type,
        health: project.health,
        healthNote: project.healthNote,
        healthUpdatedAt: project.healthUpdatedAt,
        targetLaunchAt: project.targetLaunchAt,
        updatedAt: project.updatedAt,
        org: project.organization,
        openChangeRequests: project._count.changeRequests,
        pendingApprovals: project._count.approvals,
        openRequests: project._count.requests,
      })),
    });
  } catch (error) {
    console.error("[internal/projects] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
