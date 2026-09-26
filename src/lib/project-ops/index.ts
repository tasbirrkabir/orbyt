import { db } from "@/lib/db";
import { nextCode, recordActivity, recordAudit, recordAuditRaw, recordNotification } from "@/lib/portal/records";
import { log } from "@/lib/observability";
import type { PortalContext } from "@/lib/portal/session";

/**
 * Project operations service: scope, change requests, the decision
 * log and recorded project health. One service, two auth surfaces:
 * portal routes call the *AsClient variants with a PortalContext,
 * the staff-keyed internal route calls the raw variants with actor
 * labels. Both surfaces get the same integrity rules:
 *   - a project (and everything under it) is always resolved through
 *     its organization, never by id alone; a foreign id is a 404;
 *   - change-request decisions are one-way, the raising side cannot
 *     decide its own request, and every decision appends a decision
 *     log entry in the same transaction;
 *   - health is a recorded fact (status + note + timestamp), set by
 *     ORBYT, never derived from progress or dates;
 *   - every mutation leaves the client-facing ledger (ActivityEvent)
 *     and the server-only audit trail in step.
 */

export class ProjectOpsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ── Closed sets (mirrored in the UI) ────────────────────────────

const SCOPE_KINDS = new Set(["INCLUSION", "EXCLUSION"]);
const SCOPE_STATUSES = new Set(["PLANNED", "IN_PROGRESS", "DONE", "DROPPED"]);
const HEALTHS = new Set(["ON_TRACK", "AT_RISK", "OFF_TRACK", "ON_HOLD"]);

// ── Project resolution ──────────────────────────────────────────

/**
 * Resolve a project inside an organization. `organizationId` is the
 * tenant boundary: null means staff-side (resolve by id only). A
 * foreign id is a 404, never a 403, so nothing about other tenants
 * leaks.
 */
export async function resolveProject(
  projectId: string,
  organizationId: string | null,
) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true, title: true, code: true },
  });
  if (!project) throw new ProjectOpsError("Not found", 404);
  if (organizationId && project.organizationId !== organizationId) {
    throw new ProjectOpsError("Not found", 404);
  }
  return project;
}

// ── Scope (staff-managed surface) ───────────────────────────────

export type ScopeItemInput = {
  projectId: string;
  title: string;
  detail?: string;
  kind: string;
  status?: string;
};

export async function addScopeItem(
  input: ScopeItemInput,
  organizationId: string | null,
): Promise<{ id: string }> {
  if (!SCOPE_KINDS.has(input.kind)) throw new ProjectOpsError("Unknown scope kind", 400);
  if (input.status && !SCOPE_STATUSES.has(input.status)) {
    throw new ProjectOpsError("Unknown scope status", 400);
  }
  const project = await resolveProject(input.projectId, organizationId);
  const position = await db.scopeItem.count({ where: { projectId: project.id } });
  const item = await db.scopeItem.create({
    data: {
      projectId: project.id,
      title: input.title,
      detail: input.detail ?? "",
      kind: input.kind,
      status: input.status ?? "PLANNED",
      position,
    },
    select: { id: true },
  });
  if (project.organizationId) {
    await db.activityEvent.create({
      data: {
        organizationId: project.organizationId,
        type: "PROJECT",
        title: `Scope updated on ${project.title}`,
        actorName: "ORBYT",
        actorRole: "ORBYT",
        targetType: "PROJECT",
        targetLabel: project.code ?? project.title,
      },
    }).catch(() => undefined);
  }
  return item;
}

export type ScopePatch = {
  title?: string;
  detail?: string;
  kind?: string;
  status?: string;
};

export async function updateScopeItem(
  scopeItemId: string,
  patch: ScopePatch,
  organizationId: string | null,
): Promise<void> {
  if (patch.kind && !SCOPE_KINDS.has(patch.kind)) throw new ProjectOpsError("Unknown scope kind", 400);
  if (patch.status && !SCOPE_STATUSES.has(patch.status)) {
    throw new ProjectOpsError("Unknown scope status", 400);
  }
  const item = await db.scopeItem.findUnique({
    where: { id: scopeItemId },
    select: {
      id: true,
      project: { select: { organizationId: true, title: true, code: true } },
    },
  });
  if (!item || (organizationId && item.project.organizationId !== organizationId)) {
    throw new ProjectOpsError("Not found", 404);
  }
  await db.scopeItem.update({ where: { id: scopeItemId }, data: patch });
  if (item.project.organizationId) {
    await db.activityEvent.create({
      data: {
        organizationId: item.project.organizationId,
        type: "PROJECT",
        title: `Scope updated on ${item.project.title}`,
        actorName: "ORBYT",
        actorRole: "ORBYT",
        targetType: "PROJECT",
        targetLabel: item.project.code ?? item.project.title,
      },
    }).catch(() => undefined);
  }
}

export async function removeScopeItem(
  scopeItemId: string,
  organizationId: string | null,
): Promise<void> {
  const item = await db.scopeItem.findUnique({
    where: { id: scopeItemId },
    select: { project: { select: { organizationId: true } } },
  });
  if (!item || (organizationId && item.project.organizationId !== organizationId)) {
    throw new ProjectOpsError("Not found", 404);
  }
  await db.scopeItem.delete({ where: { id: scopeItemId } });
}

// ── Change requests ─────────────────────────────────────────────

export type ProposeChangeRequestInput = {
  projectId: string;
  title: string;
  description: string;
  impactNote?: string;
  raisedBy: "CLIENT" | "ORBYT";
  raisedByName: string;
};

export async function proposeChangeRequest(
  input: ProposeChangeRequestInput,
  organizationId: string | null,
): Promise<{ id: string; code: string }> {
  const project = await resolveProject(input.projectId, organizationId);
  if (!project.organizationId) {
    throw new ProjectOpsError("Project has no organization", 409);
  }
  const code = await nextCode(project.organizationId, "CR");
  const cr = await db.changeRequest.create({
    data: {
      organizationId: project.organizationId,
      projectId: project.id,
      code,
      title: input.title,
      description: input.description,
      impactNote: input.impactNote ?? "",
      raisedBy: input.raisedBy,
      raisedByName: input.raisedByName,
      status: "PROPOSED",
    },
    select: { id: true, code: true },
  });

  await db.activityEvent.create({
    data: {
      organizationId: project.organizationId,
      type: "PROJECT",
      title: `${code} raised on ${project.title}`,
      actorName: input.raisedByName,
      actorRole: input.raisedBy,
      targetType: "CHANGE_REQUEST",
      targetLabel: code,
    },
  }).catch(() => undefined);

  // When ORBYT proposes, the client needs to decide: inbox notice.
  if (input.raisedBy === "ORBYT") {
    await db.notification.create({
      data: {
        organizationId: project.organizationId,
        type: "PROJECT",
        title: `Change request ${code} needs your decision`,
        body: input.title,
      },
    }).catch(() => undefined);
  }

  return cr;
}

export type DecideChangeRequestInput = {
  changeRequestId: string;
  decision: "ACCEPTED" | "DECLINED";
  decidedByRole: "CLIENT" | "ORBYT";
  decidedByName: string;
  note?: string;
};

/**
 * One-way decision on a PROPOSED change request. The rules:
 *   - the side that raised it cannot decide it (the other side does);
 *   - a decline carries a note (the why is the whole point);
 *   - the decision and its decision-log entry commit atomically.
 */
export async function decideChangeRequest(
  input: DecideChangeRequestInput,
  organizationId: string | null,
): Promise<{ code: string; status: string }> {
  const cr = await db.changeRequest.findUnique({
    where: { id: input.changeRequestId },
    select: {
      id: true, code: true, status: true, raisedBy: true, title: true,
      projectId: true, organizationId: true,
      project: { select: { id: true, title: true, code: true } },
    },
  });
  if (!cr || (organizationId && cr.organizationId !== organizationId)) {
    throw new ProjectOpsError("Not found", 404);
  }
  if (cr.status !== "PROPOSED") {
    throw new ProjectOpsError("This change request is already decided", 409);
  }
  if (cr.raisedBy === input.decidedByRole) {
    throw new ProjectOpsError("The side that raised a change cannot decide it", 403);
  }
  if (input.decision === "DECLINED" && !(input.note && input.note.trim().length > 0)) {
    throw new ProjectOpsError("A decline needs a note saying why", 400);
  }

  const decidedAt = new Date();
  const status = input.decision;
  const decisionTitle = `${cr.code} ${status === "ACCEPTED" ? "accepted" : "declined"}`;

  await db.$transaction(async (tx) => {
    const updated = await tx.changeRequest.updateMany({
      where: { id: cr.id, status: "PROPOSED" },
      data: {
        status,
        decidedAt,
        decidedByName: input.decidedByName,
        decidedByRole: input.decidedByRole,
        decisionNote: input.note ?? "",
      },
    });
    if (updated.count !== 1) {
      throw new ProjectOpsError("This change request is already decided", 409);
    }
    await tx.decisionLogEntry.create({
      data: {
        organizationId: cr.organizationId,
        projectId: cr.projectId,
        title: decisionTitle,
        context: input.note?.trim() || cr.title,
        decidedByRole: input.decidedByRole,
        decidedByName: input.decidedByName,
        sourceType: "CHANGE_REQUEST",
        sourceLabel: cr.code,
        decidedAt,
      },
    });
  });

  await db.activityEvent.create({
    data: {
      organizationId: cr.organizationId,
      type: "PROJECT",
      title: `${decisionTitle} on ${cr.project.title}`,
      actorName: input.decidedByName,
      actorRole: input.decidedByRole,
      targetType: "CHANGE_REQUEST",
      targetLabel: cr.code,
    },
  }).catch(() => undefined);

  // Tell the raising side when ORBYT makes the call.
  if (input.decidedByRole === "ORBYT") {
    await db.notification.create({
      data: {
        organizationId: cr.organizationId,
        type: "PROJECT",
        title: `${cr.code} ${status === "ACCEPTED" ? "accepted" : "declined"}`,
        body: input.note?.trim() || cr.title,
      },
    }).catch(() => undefined);
  }

  log.info("project-ops", "change request decided", {
    code: cr.code,
    status,
    by: input.decidedByRole,
  });

  return { code: cr.code, status };
}

export async function withdrawChangeRequest(
  changeRequestId: string,
  organizationId: string | null,
  byName: string,
): Promise<void> {
  const cr = await db.changeRequest.findUnique({
    where: { id: changeRequestId },
    select: {
      id: true, code: true, status: true, raisedBy: true,
      organizationId: true,
    },
  });
  if (!cr || (organizationId && cr.organizationId !== organizationId)) {
    throw new ProjectOpsError("Not found", 404);
  }
  if (cr.status !== "PROPOSED") {
    throw new ProjectOpsError("Only a proposed change can be withdrawn", 409);
  }
  await db.changeRequest.update({
    where: { id: cr.id },
    data: {
      status: "WITHDRAWN",
      decidedAt: new Date(),
      decidedByName: byName,
      decidedByRole: cr.raisedBy,
    },
  });
  await db.activityEvent.create({
    data: {
      organizationId: cr.organizationId,
      type: "PROJECT",
      title: `${cr.code} withdrawn`,
      actorName: byName,
      actorRole: cr.raisedBy,
      targetType: "CHANGE_REQUEST",
      targetLabel: cr.code,
    },
  }).catch(() => undefined);
}

// ── Decision log (standalone entries, e.g. from a meeting) ──────

export type LogDecisionInput = {
  projectId: string;
  title: string;
  context?: string;
  decidedByRole: "CLIENT" | "ORBYT";
  decidedByName: string;
  sourceType?: string;
  sourceLabel?: string;
};

export async function logDecision(
  input: LogDecisionInput,
  organizationId: string | null,
): Promise<{ id: string }> {
  const project = await resolveProject(input.projectId, organizationId);
  if (!project.organizationId) throw new ProjectOpsError("Project has no organization", 409);
  return db.decisionLogEntry.create({
    data: {
      organizationId: project.organizationId,
      projectId: project.id,
      title: input.title,
      context: input.context ?? "",
      decidedByRole: input.decidedByRole,
      decidedByName: input.decidedByName,
      sourceType: input.sourceType ?? "OTHER",
      sourceLabel: input.sourceLabel ?? "",
    },
    select: { id: true },
  });
}

// ── Project health ──────────────────────────────────────────────

const HEALTH_LABELS: Record<string, string> = {
  ON_TRACK: "on track",
  AT_RISK: "at risk",
  OFF_TRACK: "off track",
  ON_HOLD: "on hold",
};

export type SetHealthInput = {
  projectId: string;
  health: string;
  note: string;
  byName?: string;
};

/**
 * Recorded health: ORBYT sets it, the client reads it. Always with a
 * note; the timestamp is part of the fact.
 */
export async function setProjectHealth(
  input: SetHealthInput,
  organizationId: string | null,
): Promise<void> {
  if (!HEALTHS.has(input.health)) throw new ProjectOpsError("Unknown health state", 400);
  if (!input.note.trim()) throw new ProjectOpsError("A health update needs a note", 400);
  const project = await resolveProject(input.projectId, organizationId);
  if (!project.organizationId) throw new ProjectOpsError("Project has no organization", 409);

  await db.project.update({
    where: { id: project.id },
    data: {
      health: input.health,
      healthNote: input.note.trim(),
      healthUpdatedAt: new Date(),
    },
  });

  await db.activityEvent.create({
    data: {
      organizationId: project.organizationId,
      type: "PROJECT",
      title: `${project.title} marked ${HEALTH_LABELS[input.health] ?? input.health}`,
      actorName: input.byName ?? "ORBYT",
      actorRole: "ORBYT",
      targetType: "PROJECT",
      targetLabel: project.code ?? project.title,
    },
  }).catch(() => undefined);
}

// ── Portal-context wrappers (client surface) ────────────────────

export async function proposeChangeRequestAsClient(
  context: PortalContext,
  projectId: string,
  input: { title: string; description: string; impactNote?: string },
): Promise<{ id: string; code: string }> {
  const cr = await proposeChangeRequest(
    {
      projectId,
      title: input.title,
      description: input.description,
      impactNote: input.impactNote,
      raisedBy: "CLIENT",
      raisedByName: context.name,
    },
    context.organizationId,
  );
  await recordAudit(context, {
    action: "project.cr_propose",
    targetType: "CHANGE_REQUEST",
    targetLabel: cr.code,
    metadata: { projectId },
  });
  return cr;
}

export async function decideChangeRequestAsClient(
  context: PortalContext,
  changeRequestId: string,
  input: { decision: "ACCEPTED" | "DECLINED"; note?: string },
): Promise<{ code: string; status: string }> {
  const result = await decideChangeRequest(
    {
      changeRequestId,
      decision: input.decision,
      decidedByRole: "CLIENT",
      decidedByName: context.name,
      note: input.note,
    },
    context.organizationId,
  );
  await recordAudit(context, {
    action: "project.cr_decide",
    targetType: "CHANGE_REQUEST",
    targetLabel: result.code,
    metadata: { decision: input.decision },
  });
  return result;
}

export async function withdrawChangeRequestAsClient(
  context: PortalContext,
  changeRequestId: string,
): Promise<void> {
  await withdrawChangeRequest(changeRequestId, context.organizationId, context.name);
  await recordAudit(context, {
    action: "project.cr_withdraw",
    targetType: "CHANGE_REQUEST",
    targetLabel: changeRequestId,
  });
}

export { recordAuditRaw, recordNotification };
