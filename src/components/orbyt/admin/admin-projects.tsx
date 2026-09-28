"use client";

import { useState } from "react";
import Link from "next/link";
import { STAFF } from "@/content/admin";
import {
  PROJECT_STAGES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  formatDate,
} from "@/lib/portal/domain";
import type { AdminProjectsPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/orbyt/command/primitives";
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
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { AreaField, ChoiceField, OrgSelect, TextField, inputToIso, useOrgOptions } from "./admin-kit";

const COPY = STAFF.projects;

/**
 * Every project across every client. Progress is computed from
 * milestones on the server and shown as done/total; nothing here is
 * typed by hand.
 */
export function AdminProjects() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminProjectsPayload>(
    "/api/admin/projects",
  );
  const { toast } = useToast();
  const { orgs, loading: orgsLoading } = useOrgOptions();
  const noOrgs = !orgsLoading && orgs.length === 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(PROJECT_TYPES[0]);
  const [stage, setStage] = useState<string>(PROJECT_STAGES[0]);
  const [status, setStatus] = useState<string>(PROJECT_STATUSES[0]);
  const [goal, setGoal] = useState("");
  const [ownerLabel, setOwnerLabel] = useState("ORBYT crew");
  const [targetLaunch, setTargetLaunch] = useState("");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  function resetForm() {
    setOrgId("");
    setTitle("");
    setType(PROJECT_TYPES[0]);
    setStage(PROJECT_STAGES[0]);
    setStatus(PROJECT_STATUSES[0]);
    setGoal("");
    setOwnerLabel("ORBYT crew");
    setTargetLaunch("");
  }

  async function createProject() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          title: title.trim(),
          type,
          stage,
          status,
          goal: goal.trim(),
          ownerLabel: ownerLabel.trim(),
          targetLaunchAt: targetLaunch ? inputToIso(targetLaunch) : null,
        }),
      });
      if (response.ok) {
        toast({ title: COPY.created });
        setCreateOpen(false);
        resetForm();
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
      }
    } catch {
      toast({ title: STAFF.states.errorBody });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          noOrgs ? (
            <div className="flex items-center gap-3">
              <span className="max-w-56 text-right text-xs leading-relaxed text-muted-foreground">
                {COPY.needClient}
              </span>
              <Button size="sm" disabled>
                {COPY.create}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              {COPY.create}
            </Button>
          )
        }
      />

      {data.projects.length === 0 ? (
        <EmptyState
          title={COPY.emptyTitle}
          body={noOrgs ? COPY.needClient : COPY.empty}
          actionLabel={noOrgs ? undefined : COPY.create}
          onAction={noOrgs ? undefined : () => setCreateOpen(true)}
        />
      ) : (
        <ul role="list" className="space-y-3">
          {data.projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-border bg-card/50 p-5 transition-colors hover:border-primary/50"
            >
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {project.organizationName} · {project.clientId}
                  {project.code ? ` · ${project.code}` : ""}
                </p>
                <h2 className="mt-1 font-display text-base font-bold leading-tight">{project.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={project.stage} />
                  <StatusBadge status={project.status} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {project.milestoneDone}/{project.milestoneTotal} {COPY.colProgress}
                  </span>
                  {project.targetLaunchAt ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {COPY.launchLabel} {formatDate(project.targetLaunchAt)}
                    </span>
                  ) : null}
                </div>
              </div>
              <Link
                href={`/admin/projects/${project.id}`}
                aria-label={`${project.title} · ${STAFF.clients.open}`}
                className="inline-flex shrink-0 items-center border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {STAFF.clients.open}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{COPY.createTitle}</DialogTitle>
            <DialogDescription>{COPY.createSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void createProject();
            }}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="project-org"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {COPY.orgLabel}
              </label>
              <OrgSelect id="project-org" value={orgId} onChange={setOrgId} />
            </div>
            <TextField id="project-title" label={COPY.titleLabel} value={title} onChange={setTitle} />
            <div className="grid gap-4 sm:grid-cols-3">
              <ChoiceField id="project-type" label={COPY.typeLabel} value={type} onChange={setType} options={PROJECT_TYPES} />
              <ChoiceField id="project-stage" label={COPY.stageLabel} value={stage} onChange={setStage} options={PROJECT_STAGES} />
              <ChoiceField id="project-status" label={COPY.statusLabel} value={status} onChange={setStatus} options={PROJECT_STATUSES} />
            </div>
            <AreaField id="project-goal" label={COPY.goalLabel} value={goal} onChange={setGoal} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="project-owner"
                label={COPY.ownerLabel}
                value={ownerLabel}
                onChange={setOwnerLabel}
              />
              <TextField
                id="project-launch"
                label={COPY.launchLabel}
                type="date"
                value={targetLaunch}
                onChange={setTargetLaunch}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? COPY.creating : COPY.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
