"use client";

import { useState } from "react";
import { STAFF } from "@/content/admin";
import { STATUS_LABELS, formatDateTime } from "@/lib/portal/domain";
import type { AdminMeetingItem, AdminMeetingsPayload } from "@/lib/admin/types";
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
import {
  AreaField,
  Field,
  ListLabel,
  OrgSelect,
  ProjectSelect,
  TextField,
  datetimeToInput,
  inputToIso,
} from "./admin-kit";

const COPY = STAFF.meetings;
const STATES = STAFF.states;

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

function ScheduleMeetingDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(() =>
    datetimeToInput(new Date(Date.now() + 86_400_000).toISOString()),
  );
  const [durationMins, setDurationMins] = useState("30");
  const [agenda, setAgenda] = useState("");

  const duration = Number(durationMins);
  const canSubmit =
    orgId !== "" &&
    title.trim().length >= 3 &&
    startsAt !== "" &&
    Number.isFinite(duration) &&
    duration >= 5;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson("/api/admin/meetings", "POST", {
      organizationId: orgId,
      projectId: projectId || null,
      title: title.trim(),
      startsAt: inputToIso(startsAt),
      durationMins: Math.round(duration),
      agenda: agenda.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.scheduled });
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
          <Field id="meeting-add-org" label={COPY.clientLabel}>
            <OrgSelect
              id="meeting-add-org"
              value={orgId}
              onChange={(next) => {
                setOrgId(next);
                setProjectId("");
              }}
            />
          </Field>
          <Field id="meeting-add-project" label={COPY.projectLabel}>
            <ProjectSelect id="meeting-add-project" orgId={orgId} value={projectId} onChange={setProjectId} />
          </Field>
          <TextField id="meeting-add-title" label={COPY.titleLabel} value={title} onChange={setTitle} />
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <TextField
              id="meeting-add-when"
              label={COPY.whenLabel}
              type="datetime-local"
              value={startsAt}
              onChange={setStartsAt}
            />
            <TextField
              id="meeting-add-duration"
              label={COPY.durationLabel}
              type="number"
              min="5"
              value={durationMins}
              onChange={setDurationMins}
            />
          </div>
          <AreaField id="meeting-add-agenda" label={COPY.agendaLabel} value={agenda} onChange={setAgenda} rows={3} />
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

/** Notes and decisions for a completed meeting, saved straight onto the row. */
function NotesEditor({ meeting, onSaved }: { meeting: AdminMeetingItem; onSaved: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(meeting.notes);
  const [decisions, setDecisions] = useState(meeting.decisions);

  async function save() {
    if (busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/meetings/${meeting.id}`, "PATCH", {
      notes: notes.trim(),
      decisions: decisions.trim(),
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.saved });
      onSaved();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <AreaField id={`meeting-notes-${meeting.id}`} label={COPY.notesLabel} value={notes} onChange={setNotes} rows={3} />
      <AreaField
        id={`meeting-decisions-${meeting.id}`}
        label={COPY.decisionsLabel}
        value={decisions}
        onChange={setDecisions}
        rows={3}
      />
      <div>
        <Button size="sm" disabled={busy} onClick={save}>
          {busy ? STATES.working : COPY.saveNotes}
        </Button>
      </div>
    </div>
  );
}

/** Close-out for an upcoming meeting: one dialog stamps status, notes and decisions. */
function CloseOutDialog({
  meeting,
  onClose,
  onDone,
}: {
  meeting: AdminMeetingItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(meeting.notes);
  const [decisions, setDecisions] = useState(meeting.decisions);

  async function submit() {
    if (busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/meetings/${meeting.id}`, "PATCH", {
      status: "COMPLETED",
      notes: notes.trim(),
      decisions: decisions.trim(),
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
          <DialogTitle>{COPY.completeTitle}</DialogTitle>
          <DialogDescription>{meeting.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <AreaField id={`meeting-close-notes-${meeting.id}`} label={COPY.notesLabel} value={notes} onChange={setNotes} rows={3} />
          <AreaField
            id={`meeting-close-decisions-${meeting.id}`}
            label={COPY.decisionsLabel}
            value={decisions}
            onChange={setDecisions}
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={busy} onClick={submit}>
            {busy ? STATES.working : COPY.markCompleted}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MeetingRow({
  meeting,
  onClosing,
  onSaved,
}: {
  meeting: AdminMeetingItem;
  onClosing: () => void;
  onSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const upcoming = meeting.status === "UPCOMING";

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {meeting.organizationName} · {meeting.clientId}
            {meeting.projectTitle ? ` · ${meeting.projectTitle}` : ""}
          </p>
          <h3 className="mt-1 font-display text-base font-bold leading-tight">{meeting.title}</h3>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            {formatDateTime(meeting.startsAt)} · {meeting.durationMins} {COPY.minsUnit}
          </p>
        </div>
        <StatusBadge status={meeting.status} />
      </div>

      {meeting.agenda ? (
        <p className="mt-3 border-l-2 border-primary/50 pl-3 text-sm leading-relaxed text-muted-foreground">
          {meeting.agenda}
        </p>
      ) : null}

      {upcoming ? (
        <div className="mt-4">
          <Button size="sm" onClick={onClosing}>
            {COPY.markCompleted}
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {COPY.notesLabel}
          </Button>
          {expanded ? <NotesEditor meeting={meeting} onSaved={onSaved} /> : null}
        </div>
      )}
    </li>
  );
}

/**
 * The calendar across tenants: upcoming meetings first, then the
 * completed record. Closing a meeting out is one dialog that stamps
 * the status together with the notes and decisions on record.
 */
export function AdminMeetings() {
  const { data, loading, failed, retry, refresh } =
    usePortalFetch<AdminMeetingsPayload>("/api/admin/meetings");
  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState<AdminMeetingItem | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const upcoming = data.meetings.filter((meeting) => meeting.status === "UPCOMING");
  const completed = data.meetings.filter((meeting) => meeting.status !== "UPCOMING");

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            {COPY.newMeeting}
          </Button>
        }
      />

      {data.meetings.length === 0 ? (
        <EmptyState
          title={COPY.title}
          body={COPY.empty}
          actionLabel={COPY.newMeeting}
          onAction={() => setCreating(true)}
        />
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 ? (
            <section aria-label={STATUS_LABELS.UPCOMING}>
              <ListLabel>
                {STATUS_LABELS.UPCOMING} · {upcoming.length}
              </ListLabel>
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {upcoming.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    onClosing={() => setClosing(meeting)}
                    onSaved={refresh}
                  />
                ))}
              </ul>
            </section>
          ) : null}
          {completed.length > 0 ? (
            <section aria-label={STATUS_LABELS.COMPLETED}>
              <ListLabel>
                {STATUS_LABELS.COMPLETED} · {completed.length}
              </ListLabel>
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {completed.map((meeting) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    onClosing={() => setClosing(meeting)}
                    onSaved={refresh}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {creating ? (
        <ScheduleMeetingDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      ) : null}
      {closing ? (
        <CloseOutDialog
          meeting={closing}
          onClose={() => setClosing(null)}
          onDone={() => {
            setClosing(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
