import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit } from "@/lib/admin/records";
import { FILE_CATEGORIES, FILE_STATUSES } from "@/lib/portal/domain";
import type { AdminFileItem, AdminFilesPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/files (staff only)
 * POST /api/admin/files (staff only)
 *
 * The file index across tenants. Rows are records of what was emailed;
 * a link is stored only when a real, client-reachable URL exists.
 *   GET  200 { files: AdminFileItem[] }
 *   POST 201 { file: AdminFileItem }
 */

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  projectId: z.string().trim().min(1).optional().nullable(),
  name: z.string().trim().min(3).max(160),
  kind: z.string().trim().min(1).max(20).default("pdf"),
  sizeKb: z.coerce.number().int().min(0).max(10_000_000).default(0),
  version: z.string().trim().min(1).max(20).default("v1"),
  category: z.enum(FILE_CATEGORIES).default("OTHER"),
  status: z.enum(FILE_STATUSES).default("SHARED"),
  note: z.string().trim().max(400).default(""),
  link: z.string().trim().url().max(500).optional().nullable(),
});

export async function GET() {
  return adminRoute(async () => {
    const files = await db.portalFile.findMany({
      orderBy: { uploadedAt: "desc" },
      include: {
        organization: { select: { name: true, clientId: true } },
        project: { select: { id: true, title: true } },
      },
    });

    const payload: AdminFilesPayload = {
      files: files.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        clientId: row.organization.clientId,
        projectId: row.projectId,
        projectTitle: row.project?.title ?? null,
        name: row.name,
        kind: row.kind,
        sizeKb: row.sizeKb,
        version: row.version,
        category: row.category,
        status: row.status,
        uploadedBy: row.uploadedBy,
        note: row.note,
        link: row.link,
        uploadedAt: row.uploadedAt.toISOString(),
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const org = await db.organization.findUnique({ where: { id: input.organizationId } });
    if (!org) {
      throw new z.ZodError([
        { code: "custom", path: ["organizationId"], message: "That client does not exist" },
      ]);
    }
    let projectId: string | null = null;
    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, organizationId: org.id },
        select: { id: true, title: true },
      });
      if (!project) {
        throw new z.ZodError([
          { code: "custom", path: ["projectId"], message: "That project is not on this client" },
        ]);
      }
      projectId = project.id;
    }

    const created = await db.portalFile.create({
      data: {
        organizationId: org.id,
        projectId,
        name: input.name,
        kind: input.kind,
        sizeKb: input.sizeKb,
        version: input.version,
        category: input.category,
        status: input.status,
        note: input.note,
        uploadedBy: context.name,
        link: input.link ?? null,
      },
    });

    await Promise.all([
      recordStaffActivity(context, {
        organizationId: org.id,
        type: "FILE",
        title: `File indexed: ${created.name} ${created.version}`,
        targetType: "FILE",
        targetLabel: created.name,
        link: "/workspace/files",
      }),
      recordStaffAudit(context, {
        action: "file.create",
        organizationId: org.id,
        targetType: "FILE",
        targetLabel: `${created.name} ${created.version}`,
        metadata: { category: created.category, status: created.status },
      }),
    ]);

    const item: AdminFileItem = {
      id: created.id,
      organizationId: created.organizationId,
      organizationName: org.name,
      clientId: org.clientId,
      projectId: created.projectId,
      projectTitle: null,
      name: created.name,
      kind: created.kind,
      sizeKb: created.sizeKb,
      version: created.version,
      category: created.category,
      status: created.status,
      uploadedBy: created.uploadedBy,
      note: created.note,
      link: created.link,
      uploadedAt: created.uploadedAt.toISOString(),
    };
    return NextResponse.json({ file: item }, { status: 201 });
  });
}
