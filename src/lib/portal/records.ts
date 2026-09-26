import { db } from "@/lib/db";
import type { PortalContext } from "./session";

/**
 * Server-side recorders for the three cross-cutting ledgers:
 * ActivityEvent (client-visible feed), AuditLog (append-only, never
 * rendered in the portal), Notification (org inbox). Every helper is
 * fire-and-forget safe: a ledger failure never breaks the user's
 * action, it logs server-side instead.
 */

export type ActivityInput = {
  type: string;
  title: string;
  actorRole?: "CLIENT" | "ORBYT";
  actorName?: string;
  targetType?: string;
  targetLabel?: string;
  link?: string;
};

export async function recordActivity(
  context: PortalContext,
  input: ActivityInput,
): Promise<void> {
  try {
    await db.activityEvent.create({
      data: {
        organizationId: context.organizationId,
        type: input.type,
        title: input.title,
        actorName: input.actorName ?? context.name,
        actorRole: input.actorRole ?? "CLIENT",
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[records] activity write failed:", error);
  }
}

export type AuditInput = {
  action: string;
  targetType?: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Pre-authentication audit: login attempts, reset requests and other
 * events that happen before (or without) a portal context. The actor
 * is the email string the visitor typed, never trusted beyond that.
 * Same append-only ledger, same failure isolation as recordAudit.
 */
export async function recordAuditRaw(input: {
  actorEmail: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorEmail: input.actorEmail,
        actorRole: input.actorRole ?? "ANONYMOUS",
        action: input.action,
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        metadataJson: JSON.stringify(input.metadata ?? {}),
      },
    });
  } catch (error) {
    console.error("[records] raw audit write failed:", error);
  }
}

export async function recordAudit(
  context: PortalContext,
  input: AuditInput,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorEmail: context.email,
        actorRole: context.role,
        action: input.action,
        targetType: input.targetType ?? "",
        targetLabel: input.targetLabel ?? "",
        metadataJson: JSON.stringify(input.metadata ?? {}),
      },
    });
  } catch (error) {
    console.error("[records] audit write failed:", error);
  }
}

export type NotificationInput = {
  type: string;
  title: string;
  body?: string;
  link?: string;
};

/**
 * ORBYT-side notification: created when something on the ORBYT side
 * needs eyes (a report published, a system recovered, an invoice due).
 * Client-side actions post activity instead; the client does not
 * notify themselves.
 */
export async function recordNotification(
  context: PortalContext,
  input: NotificationInput,
): Promise<void> {
  try {
    await db.notification.create({
      data: {
        organizationId: context.organizationId,
        type: input.type,
        title: input.title,
        body: input.body ?? "",
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("[records] notification write failed:", error);
  }
}

/** Next sequential human code for requests/invoices, scoped per kind. */
export async function nextCode(
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
