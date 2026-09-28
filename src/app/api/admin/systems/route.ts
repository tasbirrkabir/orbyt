import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { SYSTEM_CATEGORIES, SYSTEM_STATUSES } from "@/lib/portal/domain";
import type { AdminSystemItem, AdminSystemsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/systems (staff only)
 * POST /api/admin/systems (staff only)
 *
 * GET lists every system across tenants with its check/run counts.
 * POST adds one for a client. Health states are recorded facts: the
 * desk writes what a check showed, the client reads it as fact.
 *   GET  200 { systems: AdminSystemItem[] }
 *   POST 201 { system: AdminSystemItem }
 */

const createSchema = z.object({
  organizationId: z.string().trim().min(1),
  name: z.string().trim().min(3).max(120),
  category: z.enum(SYSTEM_CATEGORIES),
  status: z.enum(SYSTEM_STATUSES).default("MONITORING"),
  description: z.string().trim().max(800).default(""),
  trigger: z.string().trim().max(800).default(""),
  actions: z.string().trim().max(800).default(""),
  connected: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  ownerLabel: z.string().trim().min(2).max(60).default("ORBYT"),
});

function mapSystem(system: {
  id: string;
  organizationId: string;
  organization?: { name: string; clientId: string };
  name: string;
  category: string;
  status: string;
  description: string;
  trigger: string;
  actions: string;
  connectedJson: string;
  ownerLabel: string;
  lastCheckedAt: Date | null;
  _count?: { checks: number; runs: number };
  lastRun?: { status: string } | null;
}): AdminSystemItem {
  let connected: string[] = [];
  try {
    const parsed = JSON.parse(system.connectedJson);
    if (Array.isArray(parsed)) connected = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    connected = [];
  }
  return {
    id: system.id,
    organizationId: system.organizationId,
    organizationName: system.organization?.name ?? "",
    clientId: system.organization?.clientId ?? "",
    name: system.name,
    category: system.category,
    status: system.status,
    description: system.description,
    trigger: system.trigger,
    actions: system.actions,
    connected,
    ownerLabel: system.ownerLabel,
    lastCheckedAt: system.lastCheckedAt?.toISOString() ?? null,
    checkCount: system._count?.checks ?? 0,
    runCount: system._count?.runs ?? 0,
    lastRunStatus: system.lastRun?.status ?? null,
  };
}

export async function GET() {
  return adminRoute(async () => {
    const systems = await db.systemEntry.findMany({
      orderBy: { name: "asc" },
      include: {
        organization: { select: { name: true, clientId: true } },
        _count: { select: { checks: true, runs: true } },
        runs: { orderBy: { ranAt: "desc" }, take: 1, select: { status: true } },
      },
    });
    const payload: AdminSystemsPayload = { systems: systems.map(mapSystem) };
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

    const created = await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: input.name,
        category: input.category,
        status: input.status,
        description: input.description,
        trigger: input.trigger,
        actions: input.actions,
        connectedJson: JSON.stringify(input.connected),
        ownerLabel: input.ownerLabel,
      },
    });

    await recordStaffAudit(context, {
      action: "system.create",
      organizationId: org.id,
      targetType: "SYSTEM",
      targetLabel: created.name,
      metadata: { category: created.category, status: created.status },
    });

    return NextResponse.json({ system: mapSystem({ ...created, organization: org }) }, { status: 201 });
  });
}
