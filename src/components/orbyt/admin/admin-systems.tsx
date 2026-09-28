"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { STAFF } from "@/content/admin";
import { CHECK_STATUSES, SYSTEM_CATEGORIES, SYSTEM_STATUSES, formatAge } from "@/lib/portal/domain";
import type { AdminSystemItem, AdminSystemsPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreaField, ChoiceField, Field, OrgSelect, TextField } from "./admin-kit";
import { cn } from "@/lib/utils";

const COPY = STAFF.systems;
const STATES = STAFF.states;

/** The closed outcome set behind AutomationRun.status (schema). */
const RUN_OUTCOMES = ["OK", "FAILED"] as const;

/**
 * One mutation helper for the room. Success answers { ok: true }; any
 * failure surfaces the API's own error line verbatim in a toast, so
 * the desk always reads the same words the server wrote.
 */
async function sendJson(
  url: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; error: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true, error: "" };
    let message: string = STATES.errorBody;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error) message = payload.error;
    } catch {
      // No JSON body; the fallback line stands.
    }
    return { ok: false, error: message };
  } catch {
    return { ok: false, error: STATES.errorBody };
  }
}

function MonoChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

function splitConnected(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function AddSystemDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string>("MONITORING");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("");
  const [actions, setActions] = useState("");
  const [connected, setConnected] = useState("");
  const [ownerLabel, setOwnerLabel] = useState("ORBYT");

  const canSubmit =
    orgId !== "" && name.trim().length >= 3 && category !== "" && ownerLabel.trim().length >= 2;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson("/api/admin/systems", "POST", {
      organizationId: orgId,
      name: name.trim(),
      category,
      status,
      description: description.trim(),
      trigger: trigger.trim(),
      actions: actions.trim(),
      connected: splitConnected(connected),
      ownerLabel: ownerLabel.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.added });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COPY.newTitle}</DialogTitle>
          <DialogDescription>{COPY.sub}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field id="system-add-org" label={COPY.clientLabel}>
            <OrgSelect id="system-add-org" value={orgId} onChange={setOrgId} />
          </Field>
          <TextField id="system-add-name" label={COPY.nameLabel} value={name} onChange={setName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceField
              id="system-add-category"
              label={COPY.categoryLabel}
              value={category}
              onChange={setCategory}
              options={SYSTEM_CATEGORIES}
            />
            <ChoiceField
              id="system-add-status"
              label={COPY.statusLabel}
              value={status}
              onChange={setStatus}
              options={SYSTEM_STATUSES}
            />
          </div>
          <AreaField
            id="system-add-desc"
            label={COPY.descLabel}
            value={description}
            onChange={setDescription}
            rows={2}
          />
          <AreaField
            id="system-add-trigger"
            label={COPY.triggerLabel}
            value={trigger}
            onChange={setTrigger}
            rows={2}
          />
          <AreaField
            id="system-add-actions"
            label={COPY.actionsLabel}
            value={actions}
            onChange={setActions}
            rows={2}
          />
          <TextField
            id="system-add-connected"
            label={COPY.connectedLabel}
            value={connected}
            onChange={setConnected}
          />
          <TextField
            id="system-add-owner"
            label={COPY.ownerLabel}
            value={ownerLabel}
            onChange={setOwnerLabel}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? COPY.creating : COPY.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditSystemDialog({
  system,
  onClose,
  onDone,
}: {
  system: AdminSystemItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(system.name);
  const [category, setCategory] = useState<string>(system.category);
  const [status, setStatus] = useState<string>(system.status);
  const [description, setDescription] = useState(system.description);
  const [trigger, setTrigger] = useState(system.trigger);
  const [actions, setActions] = useState(system.actions);
  const [connected, setConnected] = useState(system.connected.join(", "));
  const [ownerLabel, setOwnerLabel] = useState(system.ownerLabel);

  const canSubmit =
    name.trim().length >= 3 && category !== "" && status !== "" && ownerLabel.trim().length >= 2;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/systems/${system.id}`, "PATCH", {
      name: name.trim(),
      category,
      status,
      description: description.trim(),
      trigger: trigger.trim(),
      actions: actions.trim(),
      connected: splitConnected(connected),
      ownerLabel: ownerLabel.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.saved });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COPY.editTitle}</DialogTitle>
          <DialogDescription>
            {system.name} · {system.organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <TextField id="system-edit-name" label={COPY.nameLabel} value={name} onChange={setName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceField
              id="system-edit-category"
              label={COPY.categoryLabel}
              value={category}
              onChange={setCategory}
              options={SYSTEM_CATEGORIES}
            />
            <ChoiceField
              id="system-edit-status"
              label={COPY.statusLabel}
              value={status}
              onChange={setStatus}
              options={SYSTEM_STATUSES}
            />
          </div>
          <AreaField
            id="system-edit-desc"
            label={COPY.descLabel}
            value={description}
            onChange={setDescription}
            rows={2}
          />
          <AreaField
            id="system-edit-trigger"
            label={COPY.triggerLabel}
            value={trigger}
            onChange={setTrigger}
            rows={2}
          />
          <AreaField
            id="system-edit-actions"
            label={COPY.actionsLabel}
            value={actions}
            onChange={setActions}
            rows={2}
          />
          <TextField
            id="system-edit-connected"
            label={COPY.connectedLabel}
            value={connected}
            onChange={setConnected}
          />
          <TextField
            id="system-edit-owner"
            label={COPY.ownerLabel}
            value={ownerLabel}
            onChange={setOwnerLabel}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? STATES.working : COPY.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordCheckDialog({
  system,
  onClose,
  onDone,
}: {
  system: AdminSystemItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("HEALTHY");
  const [note, setNote] = useState("");

  const canSubmit = name.trim().length >= 3;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/systems/${system.id}`, "POST", {
      kind: "CHECK",
      name: name.trim(),
      status,
      note: note.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.checkRecorded });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{COPY.checkTitle}</DialogTitle>
          <DialogDescription>
            {system.name} · {system.organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <TextField id="system-check-name" label={COPY.checkName} value={name} onChange={setName} />
          <ChoiceField
            id="system-check-status"
            label={COPY.checkStatus}
            value={status}
            onChange={setStatus}
            options={CHECK_STATUSES}
          />
          <AreaField id="system-check-note" label={COPY.checkNote} value={note} onChange={setNote} rows={2} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? STATES.working : COPY.recordCheck}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordRunDialog({
  system,
  onClose,
  onDone,
}: {
  system: AdminSystemItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<string>("OK");

  const canSubmit = summary.trim().length >= 3;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/systems/${system.id}`, "POST", {
      kind: "RUN",
      summary: summary.trim(),
      status,
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.runRecorded });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{COPY.runTitle}</DialogTitle>
          <DialogDescription>
            {system.name} · {system.organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <AreaField
            id="system-run-summary"
            label={COPY.runSummary}
            value={summary}
            onChange={setSummary}
            rows={3}
          />
          <ChoiceField
            id="system-run-status"
            label={COPY.runStatus}
            value={status}
            onChange={setStatus}
            options={RUN_OUTCOMES}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? STATES.working : COPY.recordRun}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The expanded row: what the system does, who owns it, and the three desk actions. */
function SystemDetail({ system, onSaved }: { system: AdminSystemItem; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [running, setRunning] = useState(false);

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {system.description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{system.description}</p>
      ) : null}
      {system.trigger ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {COPY.triggerLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{system.trigger}</p>
        </div>
      ) : null}
      {system.actions ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {COPY.actionsLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{system.actions}</p>
        </div>
      ) : null}
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {COPY.ownerLabel}: {system.ownerLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          {COPY.editTitle}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setChecking(true)}>
          {COPY.recordCheck}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRunning(true)}>
          {COPY.recordRun}
        </Button>
      </div>

      {editing ? (
        <EditSystemDialog
          system={system}
          onClose={() => setEditing(false)}
          onDone={() => {
            setEditing(false);
            onSaved();
          }}
        />
      ) : null}
      {checking ? (
        <RecordCheckDialog
          system={system}
          onClose={() => setChecking(false)}
          onDone={() => {
            setChecking(false);
            onSaved();
          }}
        />
      ) : null}
      {running ? (
        <RecordRunDialog
          system={system}
          onClose={() => setRunning(false)}
          onDone={() => {
            setRunning(false);
            onSaved();
          }}
        />
      ) : null}
    </div>
  );
}

function SystemRow({ system, onSaved }: { system: AdminSystemItem; onSaved: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="p-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {system.organizationName} · {system.clientId}
          </p>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold leading-tight">{system.name}</span>
            <MonoChip>{system.category}</MonoChip>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={system.status} />
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </div>

      <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
        {COPY.checks}: {system.checkCount} · {COPY.runs}: {system.runCount} ·{" "}
        {system.lastCheckedAt ? formatAge(system.lastCheckedAt) : COPY.checksEmpty}
      </p>

      {system.connected.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {system.connected.map((service) => (
            <MonoChip key={service}>{service}</MonoChip>
          ))}
        </div>
      ) : null}

      {expanded ? <SystemDetail system={system} onSaved={onSaved} /> : null}
    </li>
  );
}

/**
 * Systems and automations across tenants. Health is recorded fact: the
 * desk writes what a check showed and what a run did, and the client
 * reads the same record without invention in between.
 */
export function AdminSystems() {
  const { data, loading, failed, retry, refresh } =
    usePortalFetch<AdminSystemsPayload>("/api/admin/systems");
  const [creating, setCreating] = useState(false);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            {COPY.newSystem}
          </Button>
        }
      />

      <section aria-label={COPY.title}>
        {data.systems.length === 0 ? (
          <EmptyState
            title={COPY.title}
            body={COPY.empty}
            actionLabel={COPY.newSystem}
            onAction={() => setCreating(true)}
          />
        ) : (
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {data.systems.map((system) => (
              <SystemRow key={system.id} system={system} onSaved={refresh} />
            ))}
          </ul>
        )}
      </section>

      {creating ? (
        <AddSystemDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
