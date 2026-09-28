import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";

/**
 * PATCH /api/admin/reports/[id] (staff only)
 *
 * Edits a published report: title, period, status, source, note. The
 * metrics and series snapshots are immutable here; a new snapshot
 * means a new report version, same as deliverables.
 * 200 { report } | 400 | 404
 */

const REPORT_STATUSES = ["READY", "NOT_CONNECTED"] as const;
const PERIODS = ["7D", "30D", "90D"] as const;

const patchSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  period: z.enum(PERIODS).optional(),
  status: z.enum(REPORT_STATUSES).optional(),
  dataSource: z.string().trim().max(120).optional(),
  note: z.string().trim().max(600).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const row = await db.report.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.report.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.period ? { period: input.period } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.dataSource !== undefined ? { dataSource: input.dataSource } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "report.update",
      organizationId: updated.organizationId,
      targetType: "REPORT",
      targetLabel: updated.title,
      metadata: { status: updated.status, period: updated.period },
    });

    return NextResponse.json({
      report: {
        id: updated.id,
        title: updated.title,
        period: updated.period,
        status: updated.status,
        dataSource: updated.dataSource,
        note: updated.note,
      },
    });
  });
}
