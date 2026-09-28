"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ChangeRequestBadge,
  ConsoleSection,
  EmptyNote,
  HealthBadge,
  InlineSpinner,
  RetryButton,
  WorkBadge,
  fmtDate,
  fmtDateTime,
  staffFetch,
  type StaffError,
} from "./admin-bits";

/**
 * Projects tab: cross-tenant master detail. The left rail lists every
 * engagement; the right side is the full ops plate for one project:
 * recorded health, scope, change requests, the immutable decision log
 * and the client-side queues. Every mutation posts to the keyed
 * project-ops endpoint, so the integrity rules stay in one place.
 */

type ProjectRow = {
  id: string;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  health: string;
  healthNote: string;
  healthUpdatedAt: string | null;
  targetLaunchAt: string | null;
  updatedAt: string;
  org: { id: string; name: string; clientId: string; tier: string } | null;
  openChangeRequests: number;
  pendingApprovals: number;
  openRequests: number;
};

type ProjectDetail = {
  id: string;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  goal: string;
  ownerLabel: string;
  health: string;
  healthNote: string;
  healthUpdatedAt: string | null;
  startedAt: string;
  targetLaunchAt: string | null;
  organization: {
    id: string;
    name: string;
    clientId: string;
    tier: string;
    users: Array<{ id: string; name: string | null; email: string; role: string; activatedAt: string | null }>;
  } | null;
  scopeItems: Array<{ id: string; title: string; detail: string; kind: string; status: string }>;
  changeRequests: Array<{
    id: string; code: string; title: string; description: string; impactNote: string;
    raisedBy: string; raisedByName: string; status: string;
    decidedAt: string | null; decidedByName: string; decidedByRole: string; decisionNote: string;
    createdAt: string;
  }>;
  decisions: Array<{
    id: string; title: string; context: string; decidedByRole: string;
    decidedByName: string; sourceType: string; sourceLabel: string; decidedAt: string;
  }>;
  requests: Array<{ id: string; code: string; title: string; status: string; priority: string; requesterName: string; updatedAt: string }>;
  approvals: Array<{ id: string; title: string; type: string; version: string; status: string; submittedAt: string; decidedAt: string | null; decisionComment: string }>;
};

const HEALTH_OPTIONS = [
  { value: "ON_TRACK", label: "On track" },
  { value: "AT_RISK", label: "At risk" },
  { value: "OFF_TRACK", label: "Off track" },
  { value: "ON_HOLD", label: "On hold" },
];

const SCOPE_STATUS_OPTIONS = ["PLANNED", "IN_PROGRESS", "DONE", "DROPPED"];

async function opsCall(apiKey: string, payload: Record<string, unknown>) {
  return staffFetch<{ ok: true }>(apiKey, "/api/internal/project-ops", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function ProjectsTab({
  apiKey,
  focusProjectId,
}: {
  apiKey: string;
  focusProjectId: string | null;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [manualSelection, setManualSelection] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffFetch<{ ok: true; projects: ProjectRow[] }>(apiKey, "/api/internal/projects?limit=200");
      setRows(response.projects);
    } catch (caught) {
      setError((caught as StaffError).message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  // Deep links (a proposed CR clicked on the overview) seed the
  // selection; the explicit selection always wins once made.
  const selectedId = manualSelection ?? focusProjectId;

  const visible = useMemo(() => {
    if (!rows) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(needle) ||
        (row.code ?? "").toLowerCase().includes(needle) ||
        (row.org?.name ?? "").toLowerCase().includes(needle) ||
        (row.org?.clientId ?? "").toLowerCase().includes(needle),
    );
  }, [rows, search]);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <RetryButton onClick={() => void load()} />
      </div>
    );
  }
  if (!rows) return <InlineSpinner label="Loading projects" />;
  if (rows.length === 0) {
    return (
      <EmptyNote>
        No projects yet. Convert a lead or provision a tenant with a first project.
      </EmptyNote>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="min-w-0 space-y-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search project, org, client ID"
          className="h-9 bg-white"
        />
        <div className="max-h-[40rem] space-y-1.5 overflow-y-auto pr-1">
          {visible.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setManualSelection(row.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedId === row.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm font-medium ${selectedId === row.id ? "text-white" : "text-stone-900"}`}>
                  {row.code ?? "No code"} · {row.title}
                </p>
                {row.openChangeRequests > 0 ? (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    {row.openChangeRequests} CR
                  </span>
                ) : null}
              </div>
              <p className={`mt-0.5 truncate text-xs ${selectedId === row.id ? "text-stone-300" : "text-stone-500"}`}>
                {row.org?.name ?? "No organization"}
              </p>
            </button>
          ))}
          {visible.length === 0 ? <p className="px-1 py-4 text-sm text-stone-500">No projects match.</p> : null}
        </div>
      </div>

      <div className="min-w-0">
        {selectedId ? (
          <ProjectOps apiKey={apiKey} projectId={selectedId} onChanged={() => void load()} />
        ) : (
          <EmptyNote>Select a project to run its operations.</EmptyNote>
        )}
      </div>
    </div>
  );
}

function ProjectOps({ apiKey, projectId, onChanged }: { apiKey: string; projectId: string; onChanged: () => void }) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await staffFetch<{ ok: true; project: ProjectDetail }>(apiKey, `/api/internal/projects/${projectId}`);
      setDetail(response.project);
    } catch (caught) {
      setError((caught as StaffError).message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, projectId]);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    void load();
  }, [load]);

  async function mutate(label: string, payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await opsCall(apiKey, payload);
      toast({ title: label });
      await load();
      onChanged();
    } catch (caught) {
      toast({ title: "Not applied", description: (caught as StaffError).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !detail) return <InlineSpinner label="Loading project" />;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <RetryButton onClick={() => void load()} />
      </div>
    );
  }
  if (!detail) return null;

  const activeUser = detail.organization?.users.find((user) => user.activatedAt) ?? detail.organization?.users[0];

  return (
    <div className="space-y-4">
      <ConsoleSection
        title={`${detail.code ?? "No code"} · ${detail.title}`}
        description={[
          detail.organization ? `${detail.organization.name} (${detail.organization.clientId})` : "No organization",
          `Stage ${detail.stage.toLowerCase()} · ${detail.status.toLowerCase().replace(/_/g, " ")} · ${detail.type.toLowerCase().replace(/_/g, " ")}`,
          detail.goal || "No goal recorded yet.",
        ].join(" · ")}
        aside={
          <div className="text-right">
            <HealthBadge health={detail.health} />
            {detail.targetLaunchAt ? (
              <p className="mt-1 text-xs text-stone-500">Target launch {fmtDate(detail.targetLaunchAt)}</p>
            ) : null}
          </div>
        }
      >
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Owner crew</p>
            <p className="mt-0.5 text-stone-800">{detail.ownerLabel || "ORBYT crew"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Primary contact</p>
            <p className="mt-0.5 truncate text-stone-800">
              {activeUser ? `${activeUser.name ?? "Unnamed"} · ${activeUser.email}` : "No owner yet"}
              {activeUser && !activeUser.activatedAt ? " · invite not activated" : ""}
            </p>
          </div>
        </div>
      </ConsoleSection>

      <HealthPanel detail={detail} busy={busy} onSet={(health, note) => void mutate("Health recorded", { action: "health.set", projectId: detail.id, health, note })} />

      <ScopePanel detail={detail} busy={busy} onAdd={(payload) => void mutate("Scope item added", { action: "scope.add", projectId: detail.id, ...payload })} onUpdate={(id, payload) => void mutate("Scope item updated", { action: "scope.update", id, ...payload })} onRemove={(id) => void mutate("Scope item removed", { action: "scope.remove", id })} />

      <ChangeRequestPanel detail={detail} busy={busy} onPropose={(payload) => void mutate(`Change request filed`, { action: "cr.propose", projectId: detail.id, ...payload })} onDecide={(id, decision, note) => void mutate(`Change request ${decision.toLowerCase()}`, { action: "cr.decide", id, decision, note })} />

      <DecisionPanel detail={detail} busy={busy} onLog={(payload) => void mutate("Decision logged", { action: "decision.log", projectId: detail.id, ...payload })} />

      <ConsoleSection title="Client queues" description="What this client is waiting on. These run through the portal; staff work them from the portal APIs and meetings, shown here for context.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Latest requests</p>
            {detail.requests.length === 0 ? (
              <p className="text-sm text-stone-500">No requests filed.</p>
            ) : (
              <ul className="space-y-1.5">
                {detail.requests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
                    <span className="min-w-0 truncate text-sm text-stone-800">
                      <span className="font-mono text-xs text-stone-500">{request.code}</span> {request.title}
                    </span>
                    <WorkBadge status={request.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Latest approvals</p>
            {detail.approvals.length === 0 ? (
              <p className="text-sm text-stone-500">No approvals raised.</p>
            ) : (
              <ul className="space-y-1.5">
                {detail.approvals.map((approval) => (
                  <li key={approval.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
                    <span className="min-w-0 truncate text-sm text-stone-800">{approval.title} ({approval.version})</span>
                    <WorkBadge status={approval.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ConsoleSection>
    </div>
  );
}

// ── Health ──────────────────────────────────────────────────────

function HealthPanel({
  detail,
  busy,
  onSet,
}: {
  detail: ProjectDetail;
  busy: boolean;
  onSet: (health: string, note: string) => void;
}) {
  const [health, setHealth] = useState<string>("");
  const [note, setNote] = useState("");

  return (
    <ConsoleSection
      title="Recorded health"
      description={`Set by ORBYT with a note, never derived from progress. Last recorded ${detail.healthUpdatedAt ? fmtDateTime(detail.healthUpdatedAt) : "never"}.`}
    >
      {detail.health ? (
        <p className="mb-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
          {detail.healthNote || "No note recorded."}
        </p>
      ) : (
        <p className="mb-4 text-sm text-stone-500">Not assessed yet. The client portal says exactly that until you record it.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto]">
        <div>
          <Label className="text-xs text-stone-500">New state</Label>
          <Select value={health} onValueChange={setHealth}>
            <SelectTrigger className="mt-1 bg-white">
              <SelectValue placeholder="Choose state" />
            </SelectTrigger>
            <SelectContent>
              {HEALTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-stone-500">Why (required)</Label>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="One honest sentence the client will read."
            className="mt-1 min-h-[42px] bg-white"
            rows={1}
          />
        </div>
        <div className="flex items-end">
          <Button
            disabled={busy || !health || note.trim().length < 2}
            onClick={() => {
              onSet(health, note.trim());
              setHealth("");
              setNote("");
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Record
          </Button>
        </div>
      </div>
    </ConsoleSection>
  );
}

// ── Scope ───────────────────────────────────────────────────────

function ScopePanel({
  detail,
  busy,
  onAdd,
  onUpdate,
  onRemove,
}: {
  detail: ProjectDetail;
  busy: boolean;
  onAdd: (payload: { title: string; detail?: string; kind: string }) => void;
  onUpdate: (id: string, payload: { status: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [itemDetail, setItemDetail] = useState("");
  const [kind, setKind] = useState("INCLUSION");

  const inclusions = detail.scopeItems.filter((item) => item.kind === "INCLUSION");
  const exclusions = detail.scopeItems.filter((item) => item.kind === "EXCLUSION");

  return (
    <ConsoleSection
      title="Scope"
      description="What the engagement includes and what it explicitly excludes. Scope changes go through change requests, not silent edits; use this for the initial build-out and factual corrections."
    >
      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Scope item title"
          className="h-9 bg-white sm:flex-1"
        />
        <Input
          value={itemDetail}
          onChange={(event) => setItemDetail(event.target.value)}
          placeholder="Optional detail"
          className="h-9 bg-white sm:flex-1"
        />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="h-9 w-full bg-white sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCLUSION">Included</SelectItem>
            <SelectItem value="EXCLUSION">Explicitly excluded</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-9"
          disabled={busy || title.trim().length < 2}
          onClick={() => {
            onAdd({ title: title.trim(), detail: itemDetail.trim() || undefined, kind });
            setTitle("");
            setItemDetail("");
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScopeList heading="Included" items={inclusions} busy={busy} onUpdate={onUpdate} onRemove={onRemove} />
        <ScopeList heading="Explicitly excluded" items={exclusions} busy={busy} onUpdate={onUpdate} onRemove={onRemove} />
      </div>
    </ConsoleSection>
  );
}

function ScopeList({
  heading,
  items,
  busy,
  onUpdate,
  onRemove,
}: {
  heading: string;
  items: ProjectDetail["scopeItems"];
  busy: boolean;
  onUpdate: (id: string, payload: { status: string }) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{heading}</p>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-center text-xs text-stone-500">Nothing here yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-stone-800">{item.title}</p>
                {item.detail ? <p className="truncate text-xs text-stone-500">{item.detail}</p> : null}
              </div>
              <Select value={item.status} onValueChange={(status) => onUpdate(item.id, { status })} disabled={busy}>
                <SelectTrigger className="h-8 w-32 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {status.replace(/_/g, " ").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-stone-400 hover:text-red-700"
                disabled={busy}
                onClick={() => onRemove(item.id)}
                title="Remove scope item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Change requests ─────────────────────────────────────────────

function ChangeRequestPanel({
  detail,
  busy,
  onPropose,
  onDecide,
}: {
  detail: ProjectDetail;
  busy: boolean;
  onPropose: (payload: { title: string; description: string; impactNote?: string }) => void;
  onDecide: (id: string, decision: "ACCEPTED" | "DECLINED", note?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [declineNotes, setDeclineNotes] = useState<Record<string, string>>({});

  const open = detail.changeRequests.filter((cr) => cr.status === "PROPOSED");
  const settled = detail.changeRequests.filter((cr) => cr.status !== "PROPOSED");

  return (
    <ConsoleSection
      title="Change requests"
      description="Formal changes to scope with the impact spelled out. ORBYT proposes here; the client decides in their portal. Client-raised requests are decided by ORBYT, here."
    >
      <div className="mb-4 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Change title (min 4 characters)"
            className="h-9 bg-white sm:flex-1"
          />
          <Input
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
            placeholder="Impact: effort, dates, price (optional)"
            className="h-9 bg-white sm:flex-1"
          />
        </div>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What changes and why. The client reads this verbatim (min 10 characters)."
          className="bg-white"
          rows={2}
        />
        <Button
          size="sm"
          disabled={busy || title.trim().length < 4 || description.trim().length < 10}
          onClick={() => {
            onPropose({ title: title.trim(), description: description.trim(), impactNote: impact.trim() || undefined });
            setTitle("");
            setDescription("");
            setImpact("");
          }}
        >
          <Plus className="h-4 w-4" /> Propose to client
        </Button>
      </div>

      {open.length === 0 ? (
        <p className="mb-4 text-sm text-stone-500">No open change requests.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {open.map((cr) => (
            <li key={cr.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-900">
                  <span className="font-mono text-xs text-stone-500">{cr.code}</span> {cr.title}
                </p>
                <ChangeRequestBadge status={cr.status} />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{cr.description}</p>
              {cr.impactNote ? <p className="mt-1 text-xs text-stone-500">Impact: {cr.impactNote}</p> : null}
              <p className="mt-1 text-xs text-stone-500">
                Raised by {cr.raisedBy === "CLIENT" ? cr.raisedByName || "the client" : "ORBYT"} · {fmtDateTime(cr.createdAt)}
              </p>
              {cr.raisedBy === "CLIENT" ? (
                <div className="mt-3 space-y-2">
                  <Input
                    value={declineNotes[cr.id] ?? ""}
                    onChange={(event) => setDeclineNotes((notes) => ({ ...notes, [cr.id]: event.target.value }))}
                    placeholder="Note (required for a decline: the why is the point)"
                    className="h-9 bg-white"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => onDecide(cr.id, "ACCEPTED")}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-800 hover:bg-red-50"
                      disabled={busy || (declineNotes[cr.id] ?? "").trim().length === 0}
                      onClick={() => {
                        onDecide(cr.id, "DECLINED", (declineNotes[cr.id] ?? "").trim());
                        setDeclineNotes((notes) => ({ ...notes, [cr.id]: "" }));
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-stone-500">Waiting on the client. ORBYT cannot decide its own proposal.</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {settled.length > 0 ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-stone-500">
            Decided or withdrawn ({settled.length})
          </summary>
          <ul className="mt-2 space-y-1.5">
            {settled.map((cr) => (
              <li key={cr.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
                <span className="min-w-0 truncate text-sm text-stone-700">
                  <span className="font-mono text-xs text-stone-500">{cr.code}</span> {cr.title}
                </span>
                <span className="flex items-center gap-2">
                  <ChangeRequestBadge status={cr.status} />
                  <span className="text-xs text-stone-400">{cr.decidedAt ? fmtDate(cr.decidedAt) : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </ConsoleSection>
  );
}

// ── Decision log ────────────────────────────────────────────────

const DECISION_SOURCES = ["OTHER", "MEETING", "APPROVAL", "REQUEST", "CHANGE_REQUEST"];

function DecisionPanel({
  detail,
  busy,
  onLog,
}: {
  detail: ProjectDetail;
  busy: boolean;
  onLog: (payload: { title: string; context?: string; sourceType?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [sourceType, setSourceType] = useState("OTHER");

  return (
    <ConsoleSection
      title="Decision log"
      description="The why-does-it-work-this-way record. Immutable from every interface: entries are appended, never edited."
    >
      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="The decision, past tense (min 4 characters)"
          className="h-9 bg-white sm:flex-[2]"
        />
        <Input
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Why (optional)"
          className="h-9 bg-white sm:flex-1"
        />
        <Select value={sourceType} onValueChange={setSourceType}>
          <SelectTrigger className="h-9 w-full bg-white sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DECISION_SOURCES.map((source) => (
              <SelectItem key={source} value={source}>
                {source.replace(/_/g, " ").toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-9"
          disabled={busy || title.trim().length < 4}
          onClick={() => {
            onLog({ title: title.trim(), context: context.trim() || undefined, sourceType });
            setTitle("");
            setContext("");
          }}
        >
          <Plus className="h-4 w-4" /> Log
        </Button>
      </div>

      {detail.decisions.length === 0 ? (
        <p className="text-sm text-stone-500">Nothing decided yet.</p>
      ) : (
        <ol className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {detail.decisions.map((decision) => (
            <li key={decision.id} className="rounded-lg border border-stone-200 px-3 py-2">
              <p className="text-sm font-medium text-stone-900">{decision.title}</p>
              {decision.context ? <p className="mt-0.5 text-sm text-stone-600">{decision.context}</p> : null}
              <p className="mt-1 text-xs text-stone-500">
                {decision.decidedByRole} · {decision.decidedByName}
                {decision.sourceLabel ? ` · via ${decision.sourceLabel}` : ""} · {fmtDateTime(decision.decidedAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </ConsoleSection>
  );
}
