import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import { mapMilestone, mapProjectSummary } from "@/lib/portal/mappers";
import type { ProjectDetailPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/projects/[id] (protected)
 * The full project room: summary, milestones, deliverables, crew
 * updates and the file index. The [id] is never trusted: the query
 * scopes by organizationId, so a foreign project id is a 404.
 * Contract: 200 ProjectDetailPayload | 401 | 404 | 500.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const { id } = await params;

    const project = await db.project.findFirst({
      where: { id, organizationId: context.organizationId },
      include: {
        milestones: { orderBy: { position: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
        deliverables: { orderBy: { createdAt: "desc" } },
        scopeItems: { orderBy: [{ kind: "asc" }, { position: "asc" }] },
        changeRequests: { orderBy: { createdAt: "desc" } },
        decisions: { orderBy: { decidedAt: "desc" } },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [files, threadCount] = await Promise.all([
      db.portalFile.findMany({
        where: { organizationId: context.organizationId, projectId: project.id },
        orderBy: { uploadedAt: "desc" },
      }),
      db.messageThread.count({
        where: { organizationId: context.organizationId, projectId: project.id },
      }),
    ]);

    const payload: ProjectDetailPayload = {
      identity: identityOf(context),
      project: {
        ...mapProjectSummary(project),
        description: project.goal,
      },
      milestones: project.milestones.map(mapMilestone),
      deliverables: project.deliverables.map((deliverable) => ({
        id: deliverable.id,
        title: deliverable.title,
        detail: deliverable.detail,
        status: deliverable.status,
        channel: deliverable.channel,
        approvalState: deliverable.approvalState,
        version: deliverable.version,
        category: deliverable.category,
        link: deliverable.link,
        deliveredAt: deliverable.deliveredAt?.toISOString() ?? null,
        createdAt: deliverable.createdAt.toISOString(),
      })),
      updates: project.updates.map((update) => ({
        id: update.id,
        tag: update.tag,
        title: update.title,
        body: update.body,
        acknowledgedAt: update.acknowledgedAt?.toISOString() ?? null,
        createdAt: update.createdAt.toISOString(),
      })),
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        kind: file.kind,
        sizeKb: file.sizeKb,
        version: file.version,
        category: file.category,
        status: file.status,
        uploadedBy: file.uploadedBy,
        note: file.note,
        link: file.link,
        uploadedAt: file.uploadedAt.toISOString(),
        projectId: file.projectId,
        projectTitle: project.title,
      })),
      threadCount,
      scope: project.scopeItems.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        kind: item.kind,
        status: item.status,
      })),
      changeRequests: project.changeRequests.map((cr) => ({
        id: cr.id,
        code: cr.code,
        title: cr.title,
        description: cr.description,
        impactNote: cr.impactNote,
        raisedBy: cr.raisedBy,
        raisedByName: cr.raisedByName,
        status: cr.status,
        decidedAt: cr.decidedAt?.toISOString() ?? null,
        decidedByName: cr.decidedByName,
        decidedByRole: cr.decidedByRole,
        decisionNote: cr.decisionNote,
        createdAt: cr.createdAt.toISOString(),
      })),
      decisions: project.decisions.map((entry) => ({
        id: entry.id,
        title: entry.title,
        context: entry.context,
        decidedByRole: entry.decidedByRole,
        decidedByName: entry.decidedByName,
        sourceType: entry.sourceType,
        sourceLabel: entry.sourceLabel,
        decidedAt: entry.decidedAt.toISOString(),
      })),
    };

    return NextResponse.json(payload);
  });
}
