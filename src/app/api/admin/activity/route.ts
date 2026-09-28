import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminRoute } from "@/lib/admin/api";
import type { AdminActivityPayload } from "@/lib/admin/types";

/**
 * GET /api/admin/activity (staff only)
 *
 * The audit log: append-only, every staff and client security-relevant
 * action, newest first, optionally filtered by actor role.
 * 200 AdminActivityPayload | 401
 */
export async function GET(request: Request) {
  return adminRoute(async () => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    const [logs, orgs] = await Promise.all([
      db.auditLog.findMany({
        where: role === "ADMIN" || role === "CLIENT" ? { actorRole: role } : {},
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      db.organization.findMany({ select: { id: true, name: true } }),
    ]);

    // Audit rows carry the org id in metadataJson when relevant; the
    // mapping keeps it readable without exposing raw metadata.
    const nameById = new Map(orgs.map((org) => [org.id, org.name]));

    const payload: AdminActivityPayload = {
      audit: logs.map((row) => {
        let organizationName: string | null = null;
        try {
          const metadata = JSON.parse(row.metadataJson) as { organizationId?: unknown };
          if (typeof metadata.organizationId === "string") {
            organizationName = nameById.get(metadata.organizationId) ?? null;
          }
        } catch {
          organizationName = null;
        }
        return {
          id: row.id,
          actorEmail: row.actorEmail,
          actorRole: row.actorRole,
          action: row.action,
          targetType: row.targetType,
          targetLabel: row.targetLabel,
          organizationName,
          createdAt: row.createdAt.toISOString(),
        };
      }),
    };
    return NextResponse.json(payload);
  });
}
