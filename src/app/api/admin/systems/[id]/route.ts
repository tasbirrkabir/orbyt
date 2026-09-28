import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { CHECK_STATUSES, SYSTEM_CATEGORIES, SYSTEM_STATUSES } from "@/lib/portal/domain";

/**
 * PATCH  /api/admin/systems/[id] (staff only)
 * POST   /api/admin/systems/[id] (staff only)
 * DELETE /api/admin/systems/[id] (staff only)
 *
 * PATCH edits the system row. POST records a check or a run (kind:
 * CHECK | RUN); both stamp the system's lastCheckedAt and surface in
 * the client's system detail as recorded history.
 *   PATCH  200 { system } | 404
 *   POST   201 { check | run } | 404
 *   DELETE 200 { ok: true } | 404
 */

const patchSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  category: z.enum(SYSTEM_CATEGORIES).optional(),
  status: z.enum(SYSTEM_STATUSES).optional(),
  description: z.string().trim().max(800).optional(),
  trigger: z.string().trim().max(800).optional(),
  actions: z.string().trim().max(800).optional(),
  connected: z.array(z.string().trim().min(1).max(60)).max(12).optional(),
  ownerLabel: z.string().trim().min(2).max(60).optional(),
});

const recordSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("CHECK"),
    name: z.string().trim().min(3).max(120),
    status: z.enum(CHECK_STATUSES).default("HEALTHY"),
    note: z.string().trim().max(600).default(""),
  }),
  z.object({
    kind: z.literal("RUN"),
    summary: z.string().trim().min(3).max(600),
    status: z.enum(["OK", "FAILED"]).default("OK"),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const row = await db.systemEntry.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.systemEntry.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.status ? { status: input.status, lastUpdatedAt: new Date() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.trigger !== undefined ? { trigger: input.trigger } : {}),
        ...(input.actions !== undefined ? { actions: input.actions } : {}),
        ...(input.connected ? { connectedJson: JSON.stringify(input.connected) } : {}),
        ...(input.ownerLabel ? { ownerLabel: input.ownerLabel } : {}),
      },
    });

    await recordStaffAudit(context, {
      action: "system.update",
      organizationId: updated.organizationId,
      targetType: "SYSTEM",
      targetLabel: updated.name,
      metadata: { status: updated.status },
    });

    return NextResponse.json({ system: { id: updated.id, status: updated.status } });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, recordSchema);
    const row = await db.systemEntry.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (input.kind === "CHECK") {
      const [check] = await db.$transaction([
        db.systemCheck.create({
          data: {
            systemId: id,
            name: input.name,
            status: input.status,
            note: input.note,
          },
        }),
        db.systemEntry.update({ where: { id }, data: { lastCheckedAt: new Date() } }),
      ]);

      const attention = input.status === "ISSUE" || input.status === "OFFLINE";
      const tasks: Promise<void>[] = [
        recordStaffAudit(context, {
          action: "system.check",
          organizationId: row.organizationId,
          targetType: "SYSTEM",
          targetLabel: row.name,
          metadata: { status: input.status },
        }),
      ];
      if (attention) {
        tasks.push(
          recordStaffNotification(context, {
            organizationId: row.organizationId,
            type: "SYSTEM",
            title: `Check flagged an issue: ${row.name}`,
            body: input.note || `Recorded result: ${input.status}. The crew is on it.`,
            link: "/workspace/systems",
          }),
        );
      }
      await Promise.all(tasks);

      return NextResponse.json(
        {
          check: {
            id: check.id,
            name: check.name,
            status: check.status,
            note: check.note,
            checkedAt: check.checkedAt.toISOString(),
          },
        },
        { status: 201 },
      );
    }

    const run = await db.automationRun.create({
      data: {
        systemId: id,
        summary: input.summary,
        status: input.status,
      },
    });

    await Promise.all([
      recordStaffAudit(context, {
        action: "system.run",
        organizationId: row.organizationId,
        targetType: "SYSTEM",
        targetLabel: row.name,
        metadata: { status: input.status },
      }),
      recordStaffActivity(context, {
        organizationId: row.organizationId,
        type: "SYSTEM",
        title:
          input.status === "OK"
            ? `Automation run completed: ${row.name}`
            : `Automation run failed: ${row.name}, retry on record`,
        targetType: "SYSTEM",
        targetLabel: row.name,
        link: "/workspace/systems",
      }),
    ]);

    return NextResponse.json(
      {
        run: {
          id: run.id,
          summary: run.summary,
          status: run.status,
          ranAt: run.ranAt.toISOString(),
        },
      },
      { status: 201 },
    );
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const row = await db.systemEntry.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.systemEntry.delete({ where: { id } });

    await recordStaffAudit(context, {
      action: "system.delete",
      organizationId: row.organizationId,
      targetType: "SYSTEM",
      targetLabel: row.name,
    });

    return NextResponse.json({ ok: true });
  });
}
