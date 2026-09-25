import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portalRoute } from "@/lib/portal/api";
import { mapProjectSummary } from "@/lib/portal/mappers";

/**
 * GET /api/portal/projects (protected)
 * Every project for the authenticated organization with computed
 * progress. Contract: 200 { projects: ProjectSummary[] } | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const projects = await db.project.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { startedAt: "desc" },
      include: {
        milestones: { orderBy: { position: "asc" } },
        updates: { orderBy: { createdAt: "desc" }, take: 1 },
        approvals: { where: { status: "PENDING" }, select: { id: true, status: true } },
      },
    });

    return NextResponse.json({
      projects: projects.map(mapProjectSummary),
    });
  });
}
