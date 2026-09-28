import { db } from "@/lib/db";
import type { AdminContext } from "./session";

/**
 * Staff-side recorders. Every management action writes the same three
 * ledgers the client portal reads: ActivityEvent (the client-visible
 * feed, actor ORBYT), AuditLog (append-only, who did what), and
 * Notification (the org inbox). Fire-and-forget safe: a ledger failure
 * logs server-side and never breaks the action itself.
 */

export type StaffActivityInput = {
  organizationId: string;
  type: string;
  title: string;
  targetType?: string;
  targetLabel?: string;
  link?: string;
};

export async function recordStaffActivity(
  actor: AdminContext,
  input: StaffActivityInput,
): Promise<void> {
  try {
    await db.activityEvent.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        title: input.title,
        actorName: actor.name,
        actorRole: "ORBYT",
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[admin-records] activity write failed:", error);
  }
}

export type StaffAuditInput = {
  action: string;
  organizationId?: string;
  targetType?: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
};

export async function recordStaffAudit(
  actor: AdminContext,
  input: StaffAuditInput,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorEmail: actor.email,
        actorRole: "ADMIN",
        action: input.action,
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        metadataJson: JSON.stringify({
          ...(input.metadata ?? {}),
          ...(input.organizationId ? { organizationId: input.organizationId } : {}),
        }),
      },
    });
  } catch (error) {
    console.error("[admin-records] audit write failed:", error);
  }
}

export type StaffNotificationInput = {
  organizationId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function recordStaffNotification(
  actor: AdminContext,
  input: StaffNotificationInput,
): Promise<void> {
  try {
    await db.notification.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        title: input.title,
        body: input.body ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[admin-records] notification write failed:", error);
  }
}

/** Next sequential human code per org: REQ-XXXX / INV-XXXX / PRJ-XXX. */
export async function nextStaffCode(
  organizationId: string,
  kind: "REQ" | "INV" | "PRJ",
): Promise<string> {
  if (kind === "REQ") {
    const count = await db.request.count({ where: { organizationId } });
    return `REQ-${String(count + 1).padStart(4, "0")}`;
  }
  if (kind === "INV") {
    const count = await db.invoice.count({ where: { organizationId } });
    return `INV-${String(count + 1).padStart(4, "0")}`;
  }
  const count = await db.project.count({ where: { organizationId } });
  return `PRJ-${String(count + 1).padStart(3, "0")}`;
}

/** Issue a fresh portal key: ORB-XXXX, collision-retried. */
export async function nextClientId(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 4; i += 1) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const candidate = `ORB-${suffix}`;
    const clash = await db.organization.findUnique({ where: { clientId: candidate } });
    if (!clash) return candidate;
  }
  throw new Error("Could not issue a unique client ID");
}
