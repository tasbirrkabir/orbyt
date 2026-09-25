import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { FilesPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/files (protected)
 * The secure file index for this organization. Rows are metadata;
 * the transport is email, and a link exists only when a real,
 * client-reachable URL exists. Contract: 200 FilesPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const files = await db.portalFile.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { uploadedAt: "desc" },
      include: { project: { select: { title: true } } },
    });

    const payload: FilesPayload = {
      identity: identityOf(context),
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
        projectTitle: file.project?.title ?? null,
      })),
    };

    return NextResponse.json(payload);
  });
}
