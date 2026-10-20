"use client";

import { useState } from "react";
import Link from "next/link";
import { STAFF, STAFF_NAV_ITEMS } from "@/content/admin";
import {
  FILE_CATEGORIES,
  MILESTONE_STATUSES,
  PROJECT_STAGES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  STATUS_LABELS,
  formatDate,
  formatDateTime,
} from "@/lib/portal/domain";
import type {
  AdminDeliverableItem,
  AdminMilestoneItem,
  AdminProjectDetailPayload,
} from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import {
  ErrorState,
  LoadingState,
  PageHeader,
  ProgressBar,
} from "@/components/orbyt/command/primitives";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPanel, AreaField, ChoiceField, TextField, dateToInput, inputToIso } from "./admin-kit";

const COPY = STAFF.projects;

const MILESTONE_OPTIONS = MILESTONE_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status] ?? status,
}));
const DELIVERABLE_STATUS_OPTIONS = ["DELIVERED", "IN PREP"].map((value) => ({
  value,
  label: STATUS_LABELS[value] ?? value.replaceAll("_", " ").toLowerCase(),
}));
const APPROVAL_OPTIONS = ["DRAFT", "IN REVIEW", "APPROVED", "FINAL"].map((value) => ({
  value,
  label: STATUS_LABELS[value] ?? value.replaceAll("_", " ").toLowerCase(),
}));

function TagChip({ tag }: { tag: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
        tag === "SHIPPED"
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {tag}
    </span>
  );
}

function VersionChip({ version }: { version: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {version}
    </span>
  );
}

/**
 * The desk side of one project: profile, milestones, the crew log the
 * client reads, and the deliverable records. Progress is computed from
 * milestones; a project with none shows 0/0 and no bar value.
 */
export function AdminProjectDetail({ projectId }: { projectId: string }) {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminProjectDetailPayload>(
    `/api/admin/projects/${projectId}`,
  );
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  // Edit project
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(PROJECT_TYPES[0]);
  const [stage, setStage] = useState<string>(PROJECT_STAGES[0]);
  const [status, setStatus] = useState<string>(PROJECT_STATUSES[0]);
  const [goal, setGoal] = useState("");
  const [ownerLabel, setOwnerLabel] = useState("");
  const [targetLaunch, setTargetLaunch] = useState("");

  // Add milestone
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDue, setMilestoneDue] = useState("");
  const [deleteFor, setDeleteFor] = useState<AdminMilestoneItem | null>(null);

  // Post crew update
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateTag, setUpdateTag] = useState("NOTE");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");

  // Add deliverable
  const [addDeliverableOpen, setAddDeliverableOpen] = useState(false);
  const [deliverableTitle, setDeliverableTitle] = useState("");
  const [deliverableDetail, setDeliverableDetail] = useState("");
  const [deliverableVersion, setDeliverableVersion] = useState("v1");
  const [deliverableCategory, setDeliverableCategory] = useState<string>(FILE_CATEGORIES[0]);
  const [deliverableStatus, setDeliverableStatus] = useState("IN PREP");
  const [deliverableApproval, setDeliverableApproval] = useState("DRAFT");
  const [deliverableLink, setDeliverableLink] = useState("");

  // Edit deliverable
  const [editFor, setEditFor] = useState<AdminDeliverableItem | null>(null);
  const [editVersion, setEditVersion] = useState("");
  const [editStatus, setEditStatus] = useState("IN PREP");
  const [editApproval, setEditApproval] = useState("DRAFT");
  const [editLink, setEditLink] = useState("");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { project, milestones, updates, deliverables } = data;
  const pct = project.milestoneTotal > 0
    ? Math.round((project.milestoneDone / project.milestoneTotal) * 100)
    : 0;

  async function mutate(
    endpoint: string,
    method: "PATCH" | "POST" | "DELETE",
    body: unknown,
    successTitle?: string,
    onDone?: () => void,
  ) {
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (response.ok) {
        if (successTitle) toast({ title: successTitle });
        onDone?.();
        refresh();
      } else {
        let message: string = STAFF.states.errorBody;
        try {
          const payload = (await response.json()) as { error?: string };
          if (typeof payload.error === "string" && payload.error) message = payload.error;
        } catch {
          // No JSON body; the fallback line stands.
        }
        toast({ title: message });
        onDone?.();
      }
    } catch {
      toast({ title: STAFF.states.errorBody });
      onDone?.();
    } finally {
      setBusy(false);
    }
  }

  function openEdit() {
    setTitle(project.title);
    setType(project.type);
    setStage(project.stage);
    setStatus(project.status);
    setGoal(project.goal);
    setOwnerLabel(project.ownerLabel);
    setTargetLaunch(dateToInput(project.targetLaunchAt));
    setEditOpen(true);
  }

  function submitEdit() {
    void mutate(
      `/api/admin/projects/${project.id}`,
      "PATCH",
      {
        title: title.trim(),
        type,
        stage,
        status,
        goal: goal.trim(),
        ownerLabel: ownerLabel.trim(),
        targetLaunchAt: targetLaunch ? inputToIso(targetLaunch) : null,
      },
      COPY.saved,
      () => setEditOpen(false),
    );
  }

  function submitMilestone() {
    void mutate(
      `/api/admin/projects/${project.id}/milestones`,
      "POST",
      {
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim(),
        ...(milestoneDue ? { dueDate: inputToIso(milestoneDue) } : {}),
      },
      undefined,
      () => {
        setMilestoneOpen(false);
        setMilestoneTitle("");
        setMilestoneDesc("");
        setMilestoneDue("");
      },
    );
  }

  function submitUpdate() {
    void mutate(
      `/api/admin/projects/${project.id}/updates`,
      "POST",
      { tag: updateTag, title: updateTitle.trim(), body: updateBody.trim() },
      COPY.logPosted,
      () => {
        setUpdateOpen(false);
        setUpdateTag("NOTE");
        setUpdateTitle("");
        setUpdateBody("");
      },
    );
  }

  function submitDeliverable() {
    void mutate(
      "/api/admin/deliverables",
      "POST",
      {
        projectId: project.id,
        title: deliverableTitle.trim(),
        detail: deliverableDetail.trim(),
        version: deliverableVersion.trim(),
        category: deliverableCategory,
        status: deliverableStatus,
        approvalState: deliverableApproval,
        link: deliverableLink.trim() ? deliverableLink.trim() : null,
      },
      COPY.deliverableSaved,
      () => {
        setAddDeliverableOpen(false);
        setDeliverableTitle("");
        setDeliverableDetail("");
        setDeliverableVersion("v1");
        setDeliverableCategory(FILE_CATEGORIES[0]);
        setDeliverableStatus("IN PREP");
        setDeliverableApproval("DRAFT");
        setDeliverableLink("");
      },
    );
  }

  function openDeliverableEdit(deliverable: AdminDeliverableItem) {
    setEditFor(deliverable);
    setEditVersion(deliverable.version);
    setEditStatus(deliverable.status);
    setEditApproval(deliverable.approvalState);
    setEditLink(deliverable.link ?? "");
  }

  function submitDeliverableEdit() {
    if (!editFor) return;
    void mutate(
      `/api/admin/deliverables/${editFor.id}`,
      "PATCH",
      {
        version: editVersion.trim(),
        status: editStatus,
        approvalState: editApproval,
        link: editLink.trim() ? editLink.trim() : null,
      },
      COPY.deliverableSaved,
      () => setEditFor(null),
    );
  }

  return (
    <div>
      <Link
        href={STAFF_NAV_ITEMS.projects.href}
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span>
        {STAFF_NAV_ITEMS.projects.label}
      </Link>

      <PageHeader
        eyebrow={COPY.eyebrow}
        title={project.code ? `${project.code} · ${project.title}` : project.title}
        sub={
          project.organizationName
            ? `${project.organizationName} · ${project.clientId}`
            : undefined
        }
        actions={
          <Button size="sm" variant="outline" onClick={openEdit}>
            {COPY.editTitle}
          </Button>
        }
      />

      {/* Project profile */}
      <AdminPanel>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {project.organizationName} · {project.clientId}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={project.stage} />
          <StatusBadge status={project.status} />
        </div>
        {project.goal ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{project.goal}</p>
        ) : null}
        <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.ownerLabel}
            </dt>
            <dd className="mt-1 font-medium">{project.ownerLabel}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.launchLabel}
            </dt>
            <dd className="mt-1 font-medium">{project.targetLaunchAt ? formatDate(project.targetLaunchAt) : "..."}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.colProgress}
            </dt>
            <dd className="mt-1 font-medium">
              {project.milestoneDone}/{project.milestoneTotal} {COPY.milestoneDone}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <ProgressBar
            value={pct}
            label={`${COPY.colProgress} ${project.milestoneDone}/${project.milestoneTotal}`}
          />
        </div>
      </AdminPanel>

      {/* Milestones */}
      <section className="mt-10" aria-label={COPY.milestonesTitle}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.milestonesTitle}
          </h2>
          <Button size="sm" variant="outline" onClick={() => setMilestoneOpen(true)}>
            {COPY.milestoneAdd}
          </Button>
        </div>
        {milestones.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {COPY.milestonesEmpty}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(milestone.position).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-medium">{milestone.title}</p>
                    <StatusBadge status={milestone.status} />
                  </div>
                  {milestone.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
                  ) : null}
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {milestone.dueDate ? `${COPY.milestoneDue} ${formatDate(milestone.dueDate)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Select
                    value={milestone.status}
                    disabled={busy}
                    onValueChange={(next) => {
                      if (next === milestone.status) return;
                      void mutate(`/api/admin/milestones/${milestone.id}`, "PATCH", { status: next });
                    }}
                  >
                    <SelectTrigger
                      aria-label={`${milestone.title} · ${COPY.statusLabel}`}
                      className="h-9 w-[130px] border-border bg-background text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MILESTONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteFor(milestone)}
                  >
                    {COPY.milestoneDelete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Crew log */}
      <section className="mt-10" aria-label={COPY.logTitle}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.logTitle}
          </h2>
          <Button size="sm" variant="outline" onClick={() => setUpdateOpen(true)}>
            {COPY.logPost}
          </Button>
        </div>
        {updates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {COPY.logEmpty}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {updates.map((update) => (
              <li key={update.id} className="rounded-xl border border-border bg-card/60 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <TagChip tag={update.tag} />
                    <p className="truncate text-sm font-medium">{update.title}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                      update.acknowledgedAt
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-primary/40 bg-primary/10 text-foreground"
                    }`}
                  >
                    {update.acknowledgedAt ? COPY.logSigned : COPY.logAwaiting}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{update.body}</p>
                <time
                  dateTime={update.createdAt}
                  className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {formatDateTime(update.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Deliverables */}
      <section className="mt-10" aria-label={COPY.deliverablesTitle}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.deliverablesTitle}
          </h2>
          <Button size="sm" variant="outline" onClick={() => setAddDeliverableOpen(true)}>
            {COPY.deliverableAdd}
          </Button>
        </div>
        {deliverables.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {COPY.deliverablesEmpty}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {deliverables.map((deliverable) => (
              <li
                key={deliverable.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{deliverable.title}</p>
                    <VersionChip version={deliverable.version} />
                    <StatusBadge status={deliverable.status} />
                    <StatusBadge status={deliverable.approvalState} />
                  </div>
                  {deliverable.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{deliverable.detail}</p>
                  ) : null}
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {deliverable.category}
                  </p>
                  {deliverable.link ? (
                    <a
                      href={deliverable.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 block max-w-full truncate font-mono text-xs underline underline-offset-4 hover:text-foreground"
                    >
                      {deliverable.link}
                    </a>
                  ) : null}
                </div>
                <Button size="sm" variant="outline" onClick={() => openDeliverableEdit(deliverable)}>
                  {COPY.deliverableEdit}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit project */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{COPY.editTitle}</DialogTitle>
            <DialogDescription>{COPY.editSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitEdit();
            }}
          >
            <TextField id="project-edit-title" label={COPY.titleLabel} value={title} onChange={setTitle} />
            <div className="grid gap-4 sm:grid-cols-3">
              <ChoiceField id="project-edit-type" label={COPY.typeLabel} value={type} onChange={setType} options={PROJECT_TYPES} />
              <ChoiceField id="project-edit-stage" label={COPY.stageLabel} value={stage} onChange={setStage} options={PROJECT_STAGES} />
              <ChoiceField id="project-edit-status" label={COPY.statusLabel} value={status} onChange={setStatus} options={PROJECT_STATUSES} />
            </div>
            <AreaField id="project-edit-goal" label={COPY.goalLabel} value={goal} onChange={setGoal} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="project-edit-owner"
                label={COPY.ownerLabel}
                value={ownerLabel}
                onChange={setOwnerLabel}
              />
              <TextField
                id="project-edit-launch"
                label={COPY.launchLabel}
                type="date"
                value={targetLaunch}
                onChange={setTargetLaunch}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : STAFF.clients.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add milestone */}
      <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.milestoneAddTitle}</DialogTitle>
            <DialogDescription>{COPY.milestoneAddSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitMilestone();
            }}
          >
            <TextField
              id="milestone-title"
              label={COPY.milestoneTitle}
              value={milestoneTitle}
              onChange={setMilestoneTitle}
            />
            <AreaField
              id="milestone-desc"
              label={COPY.milestoneDesc}
              value={milestoneDesc}
              onChange={setMilestoneDesc}
            />
            <TextField
              id="milestone-due"
              label={COPY.milestoneDue}
              type="date"
              value={milestoneDue}
              onChange={setMilestoneDue}
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setMilestoneOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : COPY.milestoneCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post crew update */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.logPostTitle}</DialogTitle>
            <DialogDescription>{COPY.logPostSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitUpdate();
            }}
          >
            <ChoiceField
              id="update-tag"
              label={COPY.logTag}
              value={updateTag}
              onChange={setUpdateTag}
              options={["SHIPPED", "IN PROGRESS", "NOTE"]}
            />
            <TextField
              id="update-title"
              label={COPY.updateTitle}
              value={updateTitle}
              onChange={setUpdateTitle}
            />
            <AreaField id="update-body" label={COPY.logBody} value={updateBody} onChange={setUpdateBody} rows={4} />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setUpdateOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : COPY.logPostBtn}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add deliverable */}
      <Dialog open={addDeliverableOpen} onOpenChange={setAddDeliverableOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{COPY.deliverableAddTitle}</DialogTitle>
            <DialogDescription>{COPY.deliverableAddSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitDeliverable();
            }}
          >
            <TextField
              id="deliverable-title"
              label={COPY.deliverableTitle}
              value={deliverableTitle}
              onChange={setDeliverableTitle}
            />
            <AreaField
              id="deliverable-detail"
              label={COPY.deliverableDetail}
              value={deliverableDetail}
              onChange={setDeliverableDetail}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="deliverable-version"
                label={COPY.deliverableVersion}
                value={deliverableVersion}
                onChange={setDeliverableVersion}
              />
              <ChoiceField
                id="deliverable-category"
                label={COPY.deliverableCategory}
                value={deliverableCategory}
                onChange={setDeliverableCategory}
                options={FILE_CATEGORIES}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ChoiceField
                id="deliverable-status"
                label={COPY.deliverableStatus}
                value={deliverableStatus}
                onChange={setDeliverableStatus}
                options={DELIVERABLE_STATUS_OPTIONS}
              />
              <ChoiceField
                id="deliverable-approval"
                label={COPY.deliverableApproval}
                value={deliverableApproval}
                onChange={setDeliverableApproval}
                options={APPROVAL_OPTIONS}
              />
            </div>
            <TextField
              id="deliverable-link"
              label={COPY.deliverableLink}
              type="url"
              value={deliverableLink}
              onChange={setDeliverableLink}
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddDeliverableOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : COPY.deliverableCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit deliverable */}
      <Dialog
        open={editFor !== null}
        onOpenChange={(open) => {
          if (!open) setEditFor(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.deliverableEditTitle}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitDeliverableEdit();
            }}
          >
            <TextField
              id="deliverable-edit-version"
              label={COPY.deliverableVersion}
              value={editVersion}
              onChange={setEditVersion}
            />
            <ChoiceField
              id="deliverable-edit-status"
              label={COPY.deliverableStatus}
              value={editStatus}
              onChange={setEditStatus}
              options={DELIVERABLE_STATUS_OPTIONS}
            />
            <ChoiceField
              id="deliverable-edit-approval"
              label={COPY.deliverableApproval}
              value={editApproval}
              onChange={setEditApproval}
              options={APPROVAL_OPTIONS}
            />
            <TextField
              id="deliverable-edit-link"
              label={COPY.deliverableLink}
              type="url"
              value={editLink}
              onChange={setEditLink}
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditFor(null)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : STAFF.clients.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete milestone confirmation */}
      <AlertDialog
        open={deleteFor !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteFor(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{COPY.milestoneDelete}</AlertDialogTitle>
            <AlertDialogDescription>{STAFF.states.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFor(null)}>{STAFF.states.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteFor) return;
                void mutate(
                  `/api/admin/milestones/${deleteFor.id}`,
                  "DELETE",
                  undefined,
                  COPY.milestoneDeleted,
                  () => setDeleteFor(null),
                );
              }}
            >
              {COPY.milestoneDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
