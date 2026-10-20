"use client";

import { useState, type ReactNode } from "react";
import { STAFF } from "@/content/admin";
import { FILE_CATEGORIES, FILE_STATUSES, formatAge } from "@/lib/portal/domain";
import type { AdminFileItem, AdminFilesPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreaField, ChoiceField, Field, OrgSelect, ProjectSelect, TextField } from "./admin-kit";

const COPY = STAFF.files;
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

function MonoChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

function AddFileDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("pdf");
  const [sizeKb, setSizeKb] = useState("0");
  const [version, setVersion] = useState("v1");
  const [category, setCategory] = useState<string>("OTHER");
  const [status, setStatus] = useState<string>("SHARED");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");

  const sizeNumber = Number(sizeKb);
  const canSubmit =
    orgId !== "" &&
    name.trim().length >= 3 &&
    kind.trim().length >= 1 &&
    version.trim().length >= 1 &&
    Number.isFinite(sizeNumber) &&
    sizeNumber >= 0;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson("/api/admin/files", "POST", {
      organizationId: orgId,
      projectId: projectId || null,
      name: name.trim(),
      kind: kind.trim(),
      sizeKb: Math.round(sizeNumber),
      version: version.trim(),
      category,
      status,
      note: note.trim(),
      link: link.trim() === "" ? null : link.trim(),
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
          <Field id="file-add-org" label={COPY.clientLabel}>
            <OrgSelect
              id="file-add-org"
              value={orgId}
              onChange={(next) => {
                setOrgId(next);
                setProjectId("");
              }}
            />
          </Field>
          <Field id="file-add-project" label={COPY.projectLabel}>
            <ProjectSelect id="file-add-project" orgId={orgId} value={projectId} onChange={setProjectId} />
          </Field>
          <TextField id="file-add-name" label={COPY.nameLabel} value={name} onChange={setName} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="file-add-kind" label={COPY.kindLabel} value={kind} onChange={setKind} />
            <TextField
              id="file-add-size"
              label={COPY.sizeLabel}
              type="number"
              min="0"
              value={sizeKb}
              onChange={setSizeKb}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="file-add-version" label={COPY.versionLabel} value={version} onChange={setVersion} />
            <ChoiceField
              id="file-add-category"
              label={COPY.categoryLabel}
              value={category}
              onChange={setCategory}
              options={FILE_CATEGORIES}
            />
          </div>
          <ChoiceField
            id="file-add-status"
            label={COPY.statusLabel}
            value={status}
            onChange={setStatus}
            options={FILE_STATUSES}
          />
          <AreaField id="file-add-note" label={COPY.noteLabel} value={note} onChange={setNote} rows={2} />
          <TextField id="file-add-link" label={COPY.linkLabel} value={link} onChange={setLink} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? STATES.working : COPY.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditFileDialog({
  file,
  onClose,
  onDone,
}: {
  file: AdminFileItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(file.version);
  const [status, setStatus] = useState<string>(file.status);
  const [note, setNote] = useState(file.note);
  const [link, setLink] = useState(file.link ?? "");

  const canSubmit = version.trim().length >= 1;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/files/${file.id}`, "PATCH", {
      version: version.trim(),
      status,
      note: note.trim(),
      link: link.trim() === "" ? null : link.trim(),
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
          <DialogTitle>{COPY.editTitle}</DialogTitle>
          <DialogDescription>
            {file.name} · {file.organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <TextField id="file-edit-version" label={COPY.versionLabel} value={version} onChange={setVersion} />
          <ChoiceField
            id="file-edit-status"
            label={COPY.statusLabel}
            value={status}
            onChange={setStatus}
            options={FILE_STATUSES}
          />
          <AreaField id="file-edit-note" label={COPY.noteLabel} value={note} onChange={setNote} rows={2} />
          <TextField id="file-edit-link" label={COPY.linkLabel} value={link} onChange={setLink} />
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

function DeleteFileDialog({
  file,
  onClose,
  onDone,
}: {
  file: AdminFileItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/files/${file.id}`, "DELETE", {});
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.deleted });
      onDone();
    } else {
      toast({ title: result.error });
      onClose();
    }
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{COPY.delete}</AlertDialogTitle>
          <AlertDialogDescription>
            {file.name} {file.version}. {STATES.confirmDelete}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{STATES.cancel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void remove();
            }}
          >
            {busy ? STATES.working : COPY.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const ROW_GRID = "lg:grid lg:grid-cols-[1.1fr_2fr_0.9fr_0.9fr_0.9fr_auto] lg:items-start lg:gap-3";

function FileRow({
  file,
  onEdit,
  onDelete,
}: {
  file: AdminFileItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className={`p-4 ${ROW_GRID}`}>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {file.organizationName} · {file.clientId}
        </p>
        {file.projectTitle ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{file.projectTitle}</p>
        ) : null}
      </div>
      <div className="mt-2 min-w-0 lg:mt-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <MonoChip>{file.version}</MonoChip>
        </div>
        {file.note ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{file.note}</p>
        ) : null}
        {file.link ? (
          <a
            href={file.link}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 block truncate font-mono text-xs text-primary underline-offset-4 hover:underline"
          >
            {file.link}
          </a>
        ) : null}
      </div>
      <div className="mt-2 lg:mt-0">
        <MonoChip>{file.category}</MonoChip>
      </div>
      <div className="mt-2 lg:mt-0">
        <StatusBadge status={file.status} />
      </div>
      <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground lg:mt-0">
        {formatAge(file.uploadedAt)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 lg:mt-0 lg:justify-end">
        <Button size="sm" variant="outline" onClick={onEdit}>
          {COPY.editTitle}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
        >
          {COPY.delete}
        </Button>
      </div>
    </li>
  );
}

/**
 * The file index across tenants. Rows are records of what was emailed;
 * a link renders only when a real URL is on record. The desk adds,
 * corrects and removes entries; the email trail itself stays outside.
 */
export function AdminFiles() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminFilesPayload>("/api/admin/files");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminFileItem | null>(null);
  const [deleting, setDeleting] = useState<AdminFileItem | null>(null);

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
            {COPY.newFile}
          </Button>
        }
      />

      <section aria-label={COPY.title}>
        {data.files.length === 0 ? (
          <EmptyState
            title={COPY.title}
            body={COPY.empty}
            actionLabel={COPY.newFile}
            onAction={() => setCreating(true)}
          />
        ) : (
          <div>
            <div className="hidden px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground lg:grid lg:grid-cols-[1.1fr_2fr_0.9fr_0.9fr_0.9fr_auto] lg:gap-3">
              <span>{COPY.colClient}</span>
              <span>{COPY.colFile}</span>
              <span>{COPY.colCategory}</span>
              <span>{COPY.colStatus}</span>
              <span>{COPY.colUploaded}</span>
              <span aria-hidden="true" />
            </div>
            <ul role="list" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/60">
              {data.files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onEdit={() => setEditing(file)}
                  onDelete={() => setDeleting(file)}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      {creating ? (
        <AddFileDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      ) : null}
      {editing ? (
        <EditFileDialog
          file={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            refresh();
          }}
        />
      ) : null}
      {deleting ? (
        <DeleteFileDialog
          file={deleting}
          onClose={() => setDeleting(null)}
          onDone={() => {
            setDeleting(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
