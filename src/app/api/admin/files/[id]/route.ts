import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { FILE_CATEGORIES, FILE_STATUSES } from "@/lib/portal/domain";

/**
 * PATCH  /api/admin/files/[id] (staff only)
 * DELETE /api/admin/files/[id] (staff only)
 *
 * PATCH edits the index entry (version, status, note, link). DELETE
 * removes the row from the index; the email that traveled stays real,
 * the record does not.
 *   PATCH  200 { file } | 404
 *   DELETE 200 { ok: true } | 404
 */

const patchSchema = z.object({
  name: z.string().trim().min(3).max(160).optional(),
  version: z.string().trim().min(1).max(20).optional(),
  category: z.enum(FILE_CATEGORIES).optional(),
  status: z.enum(FILE_STATUSES).optional(),
  note: z.string().trim().max(400).optional(),
  link: z.string().trim().url().max(500).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const row = await db.portalFile.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.portalFile.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.version ? { version: input.version } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "file.update",
      organizationId: updated.organizationId,
      targetType: "FILE",
      targetLabel: `${updated.name} ${updated.version}`,
      metadata: { status: updated.status },
    });

    return NextResponse.json({
      file: {
        id: updated.id,
        name: updated.name,
        version: updated.version,
        category: updated.category,
        status: updated.status,
        note: updated.note,
        link: updated.link,
      },
    });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const row = await db.portalFile.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.portalFile.delete({ where: { id } });

    await recordStaffAudit(context, {
      action: "file.delete",
      organizationId: row.organizationId,
      targetType: "FILE",
      targetLabel: `${row.name} ${row.version}`,
    });

    return NextResponse.json({ ok: true });
  });
}
