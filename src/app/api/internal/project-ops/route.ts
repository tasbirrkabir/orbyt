import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProvisionKey } from "@/lib/lifecycle/guard";
import {
  addScopeItem,
  decideChangeRequest,
  logDecision,
  ProjectOpsError,
  proposeChangeRequest,
  removeScopeItem,
  setProjectHealth,
  updateScopeItem,
} from "@/lib/project-ops";
import { recordAuditRaw } from "@/lib/portal/records";

/**
 * POST /api/internal/project-ops (staff key required)
 *
 * The ORBYT-side surface for project operations, until the staff
 * console exists (Phase 12). One keyed endpoint with explicit
 * actions, every call audited:
 *
 *   scope.add      { projectId, title, detail?, kind, status? }
 *   scope.update   { id, title?, detail?, kind?, status? }
 *   scope.remove   { id }
 *   cr.propose     { projectId, title, description, impactNote? }
 *   cr.decide      { id, decision: ACCEPTED|DECLINED, note? }
 *   decision.log   { projectId, title, context?, sourceType?, sourceLabel? }
 *   health.set     { projectId, health: ON_TRACK|AT_RISK|OFF_TRACK|ON_HOLD, note }
 *
 * Contract: 200/201 { ok, ... } | 400 | 401 | 404 | 409 | 429 | 503.
 */

const scopeAdd = z.object({
  action: z.literal("scope.add"),
  projectId: z.string().min(1),
  title: z.string().trim().min(2).max(200),
  detail: z.string().trim().max(1000).optional(),
  kind: z.enum(["INCLUSION", "EXCLUSION"]),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE", "DROPPED"]).optional(),
});

const scopeUpdate = z.object({
  action: z.literal("scope.update"),
  id: z.string().min(1),
  title: z.string().trim().min(2).max(200).optional(),
  detail: z.string().trim().max(1000).optional(),
  kind: z.enum(["INCLUSION", "EXCLUSION"]).optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE", "DROPPED"]).optional(),
});

const scopeRemove = z.object({
  action: z.literal("scope.remove"),
  id: z.string().min(1),
});

const crPropose = z.object({
  action: z.literal("cr.propose"),
  projectId: z.string().min(1),
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(4000),
  impactNote: z.string().trim().max(1000).optional(),
});

const crDecide = z.object({
  action: z.literal("cr.decide"),
  id: z.string().min(1),
  decision: z.enum(["ACCEPTED", "DECLINED"]),
  note: z.string().trim().max(2000).optional(),
});

const decisionLog = z.object({
  action: z.literal("decision.log"),
  projectId: z.string().min(1),
  title: z.string().trim().min(4).max(200),
  context: z.string().trim().max(2000).optional(),
  sourceType: z.enum(["CHANGE_REQUEST", "REQUEST", "MEETING", "APPROVAL", "OTHER"]).optional(),
  sourceLabel: z.string().trim().max(80).optional(),
});

const healthSet = z.object({
  action: z.literal("health.set"),
  projectId: z.string().min(1),
  health: z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK", "ON_HOLD"]),
  note: z.string().trim().min(2, "A health update needs a note").max(1000),
});

const bodySchema = z.discriminatedUnion("action", [
  scopeAdd,
  scopeUpdate,
  scopeRemove,
  crPropose,
  crDecide,
  decisionLog,
  healthSet,
]);

export async function POST(request: Request) {
  const guard = await requireProvisionKey(request);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    let response: Record<string, unknown> = { ok: true };

    switch (input.action) {
      case "scope.add": {
        const item = await addScopeItem(
          { projectId: input.projectId, title: input.title, detail: input.detail, kind: input.kind, status: input.status },
          null,
        );
        response = { ok: true, id: item.id };
        break;
      }
      case "scope.update": {
        await updateScopeItem(input.id, { title: input.title, detail: input.detail, kind: input.kind, status: input.status }, null);
        break;
      }
      case "scope.remove": {
        await removeScopeItem(input.id, null);
        break;
      }
      case "cr.propose": {
        const cr = await proposeChangeRequest(
          {
            projectId: input.projectId,
            title: input.title,
            description: input.description,
            impactNote: input.impactNote,
            raisedBy: "ORBYT",
            raisedByName: "ORBYT crew",
          },
          null,
        );
        response = { ok: true, id: cr.id, code: cr.code };
        break;
      }
      case "cr.decide": {
        const result = await decideChangeRequest(
          {
            changeRequestId: input.id,
            decision: input.decision,
            decidedByRole: "ORBYT",
            decidedByName: "ORBYT crew",
            note: input.note,
          },
          null,
        );
        response = { ok: true, code: result.code, status: result.status };
        break;
      }
      case "decision.log": {
        const entry = await logDecision(
          {
            projectId: input.projectId,
            title: input.title,
            context: input.context,
            decidedByRole: "ORBYT",
            decidedByName: "ORBYT crew",
            sourceType: input.sourceType,
            sourceLabel: input.sourceLabel,
          },
          null,
        );
        response = { ok: true, id: entry.id };
        break;
      }
      case "health.set": {
        await setProjectHealth(
          { projectId: input.projectId, health: input.health, note: input.note, byName: "ORBYT crew" },
          null,
        );
        break;
      }
    }

    void recordAuditRaw({
      actorEmail: "staff:internal-api",
      actorRole: "STAFF",
      action: `project-ops.${input.action}`,
      targetType: "PROJECT_OPS",
      targetLabel: "id" in input ? input.id : "projectId" in input ? input.projectId : "",
      metadata: { action: input.action },
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ProjectOpsError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[internal/project-ops] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
