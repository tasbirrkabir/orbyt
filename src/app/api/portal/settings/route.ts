import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { identityOf, portalRoute, readJson } from "@/lib/portal/api";
import { recordAudit } from "@/lib/portal/records";
import { DEMO_ACCOUNTS } from "@/lib/demo";
import type { NotificationPrefs, SettingsPayload } from "@/lib/portal/types";
import type { PortalContext } from "@/lib/portal/session";

/**
 * GET   /api/portal/settings (protected)
 * PATCH /api/portal/settings (protected, writers only)
 *
 * GET returns the notification preferences. PATCH updates them; the
 * viewer role is read-only everywhere, including here.
 * Contract: GET 200 SettingsPayload | PATCH 200 SettingsPayload
 *           | 400 | 401 | 403 | 500.
 */

const DEFAULT_PREFS: NotificationPrefs = {
  approvals: true,
  requests: true,
  reports: true,
  billing: true,
  systems: true,
  meetings: true,
};

const prefsSchema = z.object({
  approvals: z.boolean().optional(),
  requests: z.boolean().optional(),
  reports: z.boolean().optional(),
  billing: z.boolean().optional(),
  systems: z.boolean().optional(),
  meetings: z.boolean().optional(),
});

function parsePrefs(json: string): NotificationPrefs {
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_PREFS;
    const record = parsed as Record<string, unknown>;
    return {
      approvals: typeof record.approvals === "boolean" ? record.approvals : true,
      requests: typeof record.requests === "boolean" ? record.requests : true,
      reports: typeof record.reports === "boolean" ? record.reports : true,
      billing: typeof record.billing === "boolean" ? record.billing : true,
      systems: typeof record.systems === "boolean" ? record.systems : true,
      meetings: typeof record.meetings === "boolean" ? record.meetings : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Security facts for the settings room, computed in one place. */
function securityState(context: PortalContext, mfaEnabledAt: Date | null) {
  return {
    mfaEnabled: Boolean(mfaEnabledAt),
    canManageMfa:
      context.role === "CLIENT_OWNER" &&
      !DEMO_ACCOUNTS.some((account) => account.clientId === context.clientId),
  };
}

export async function GET() {
  return portalRoute(
      async (context) => {
    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { notificationPrefsJson: true, mfaEnabledAt: true },
    });
    const payload: SettingsPayload = {
      identity: identityOf(context),
      prefs: parsePrefs(user?.notificationPrefsJson ?? "{}"),
      security: securityState(context, user?.mfaEnabledAt ?? null),
    };
    return NextResponse.json(payload);
  });
}

export async function PATCH(request: Request) {
  return portalRoute(async (context) => {
    const input = await readJson(request, prefsSchema);
    const current = parsePrefs(
      (
        await db.user.findUnique({
          where: { id: context.userId },
          select: { notificationPrefsJson: true },
        })
      )?.notificationPrefsJson ?? "{}",
    );

    const merged = { ...current, ...input };
    const updated = await db.user.update({
      where: { id: context.userId },
      data: { notificationPrefsJson: JSON.stringify(merged) },
      select: { mfaEnabledAt: true },
    });
    await recordAudit(context, {
      action: "settings.prefs_update",
      targetType: "ACCOUNT",
      targetLabel: context.email,
      metadata: merged,
    });

    const payload: SettingsPayload = {
      identity: identityOf(context),
      prefs: merged,
      security: securityState(context, updated.mfaEnabledAt),
    };
    return NextResponse.json(payload);
  }, { write: true });
}
