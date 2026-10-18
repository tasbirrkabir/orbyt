"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";
import {
  formatDate,
  formatMoney,
  PROJECT_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/portal/domain";
import type {
  MilestoneItem,
  OverviewPayload,
  ProjectDetailPayload,
  ProjectUpdateItem,
  ScopeItemItem,
} from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { DEMO_CLIENT_IDS } from "./demo-ids";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, ProgressBar, Section } from "./primitives";
import { StatusBadge } from "./status-badge";
import { StageRail } from "./stage-rail";

const P = COMMAND.project;

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border border-border bg-card/50 p-5", className)}>{children}</div>
  );
}

/** BUILD -> "Build". Stage values are single words from a closed set. */
function stageLabel(stage: string): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

const MILESTONE_TONE: Record<string, { glyph: string; tone: string }> = {
  DONE: { glyph: "✓", tone: "border-primary/40 bg-primary/10 text-primary" },
  ACTIVE: { glyph: "●", tone: "border-border bg-foreground/[0.06] text-foreground/70" },
  UPCOMING: { glyph: "○", tone: "border-border bg-muted text-muted-foreground/70" },
};

function milestoneMeta(milestone: MilestoneItem): string {
  const date = formatDate(
    milestone.status === "DONE" ? (milestone.completedAt ?? milestone.dueDate) : milestone.dueDate,
  );
  const state =
    milestone.status === "DONE"
      ? P.milestones.done
      : milestone.status === "ACTIVE"
        ? P.milestones.active
        : P.milestones.upcoming;
  return `${state} · ${date || "..."}`;
}

const TAG_TONE: Record<string, string> = {
  SHIPPED: "border-primary bg-primary text-[#1B1B1A]",
  "IN PROGRESS": "border-border bg-muted text-muted-foreground",
  NOTE: "border-border bg-transparent text-foreground",
};

function CrewLogRow({
  update,
  canWrite,
  onApproved,
}: {
  update: ProjectUpdateItem;
  canWrite: boolean;
  onApproved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function approve() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/portal/updates/${encodeURIComponent(update.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acknowledged: true }),
      });
      if (!response.ok) throw new Error("request failed");
      // The parent refetches; the row flips to Approved when it lands.
      onApproved();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const awaiting = update.tag === "SHIPPED" && !update.acknowledgedAt;

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
            TAG_TONE[update.tag] ?? TAG_TONE.NOTE,
          )}
        >
          {update.tag}
        </span>
        {update.acknowledgedAt ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            ✓ {P.crewLog.approved}
          </span>
        ) : null}
        {awaiting && canWrite ? (
          <Button size="sm" variant="outline" className="h-7" onClick={() => void approve()} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {P.crewLog.approve}
          </Button>
        ) : null}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {formatDate(update.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{update.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{update.body}</p>
      {failed ? (
        <p className="mt-2 text-xs text-destructive">That didn&apos;t save. Try again in a minute.</p>
      ) : null}
    </div>
  );
}

function ScopeRow({ item }: { item: ScopeItemItem }) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-sm font-semibold">{item.title}</p>
        <StatusBadge status={item.status} />
      </div>
      {item.detail ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
      ) : null}
    </div>
  );
}

/**
 * The project body, loaded once the overview hands over the active
 * project id. One fetch, one scroll: progress, facts, health, the
 * rail, the crew log and the scope, in that order.
 */
function ProjectBody({ projectId }: { projectId: string }) {
  const { data, loading, failed, retry, refresh } = usePortalFetch<ProjectDetailPayload>(
    `/api/portal/projects/${encodeURIComponent(projectId)}`,
  );

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { project, milestones, updates, scope } = data;
  const inclusions = scope.filter((item) => item.kind === "INCLUSION");
  const exclusions = scope.filter((item) => item.kind === "EXCLUSION");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Progress panel */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-lg font-bold leading-tight">{project.title}</h2>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {project.code ? `${project.code} · ` : ""}
              {PROJECT_TYPE_LABELS[project.type] ?? project.type}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold tabular-nums text-primary">
              {project.progress}%
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {P.labels.progress}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={project.progress} label={`${project.title} progress`} />
        </div>

        <div className="mt-5">
          <StageRail current={project.stage} />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {stageLabel(project.stage)}
          </p>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {P.labels.nextMilestone}
            </dt>
            <dd className="mt-0.5 font-medium">{project.nextMilestone ?? "..."}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {P.labels.targetLaunch}
            </dt>
            <dd className="mt-0.5 font-medium">{formatDate(project.targetLaunchAt) || "..."}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {P.labels.owner}
            </dt>
            <dd className="mt-0.5 font-medium">{project.ownerLabel}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-border pt-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {P.labels.goal}
          </p>
          <p className={cn("mt-1 text-sm leading-relaxed", project.goal ? "text-foreground" : "text-muted-foreground")}>
            {project.goal || P.noGoal}
          </p>
        </div>

        {/* Health: recorded fact, never derived. */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {P.labels.health}
          </p>
          {project.health ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <StatusBadge status={project.health} />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {project.healthUpdatedAt ? P.health.setAt(formatDate(project.healthUpdatedAt)) : ""}
              </span>
              {project.healthNote ? (
                <p className="w-full text-sm leading-relaxed text-muted-foreground">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{P.health.noteLabel}: </span>
                  {project.healthNote}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{P.health.notSet}</p>
          )}
        </div>
      </Panel>

      {/* The rail */}
      <Section label={P.milestones.label} sub={P.milestones.sub}>
        {milestones.length === 0 ? (
          <Panel className="border-dashed bg-transparent">
            <p className="text-sm leading-relaxed text-muted-foreground">{P.milestones.empty}</p>
          </Panel>
        ) : (
          <div className="divide-y divide-border border border-border bg-card/50">
            {milestones.map((milestone) => {
              const tone = MILESTONE_TONE[milestone.status] ?? MILESTONE_TONE.UPCOMING;
              return (
                <div key={milestone.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center border font-mono text-[10px]",
                      tone.tone,
                    )}
                  >
                    {tone.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{milestone.title}</p>
                    {milestone.description ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{milestone.description}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {milestoneMeta(milestone)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Crew log */}
      <Section label={P.crewLog.label} sub={P.crewLog.sub}>
        {updates.length === 0 ? (
          <Panel className="border-dashed bg-transparent">
            <p className="text-sm leading-relaxed text-muted-foreground">{P.crewLog.empty}</p>
          </Panel>
        ) : (
          <div className="divide-y divide-border border border-border bg-card/50">
            {updates.map((update) => (
              <CrewLogRow
                key={update.id}
                update={update}
                canWrite={data.identity.canWrite}
                onApproved={refresh}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Scope */}
      <Section label={P.scope.label} sub={P.scope.sub}>
        {inclusions.length === 0 && exclusions.length === 0 ? (
          <Panel className="border-dashed bg-transparent">
            <p className="text-sm leading-relaxed text-muted-foreground">{P.scope.empty}</p>
          </Panel>
        ) : (
          <div className="space-y-6">
            {inclusions.length > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {P.scope.included}
                </p>
                <div className="divide-y divide-border border border-border bg-card/50">
                  {inclusions.map((item) => (
                    <ScopeRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
            {exclusions.length > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {P.scope.excluded}
                </p>
                <div className="divide-y divide-border border border-border bg-card/50">
                  {exclusions.map((item) => (
                    <ScopeRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Section>
    </motion.div>
  );
}

/**
 * The Project room: the client panel's landing page and its reason to
 * exist. How far along the work is, what's done, what's next, and a
 * one-line bridge to the invoices.
 */
export function CommandProject() {
  const reduced = useReducedMotion();
  const { data, loading, failed, retry } = usePortalFetch<OverviewPayload>("/api/portal/overview");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const isDemo = DEMO_CLIENT_IDS.includes(data.identity.clientId);
  const project = data.activeProject;
  const billing = data.billing;

  return (
    <div>
      {/* Header */}
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{P.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {project ? project.title : "Your project."}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{P.sub}</p>
        {isDemo ? (
          <p className="mt-4 inline-flex max-w-2xl items-start gap-2 border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {COMMAND.demoNote.tag}
            </span>
            <span>{COMMAND.demoNote.body}</span>
          </p>
        ) : null}
      </motion.header>

      {!project ? (
        <div className="mt-10">
          <EmptyState title={P.noProjectTitle} body={P.noProjectBody} />
        </div>
      ) : (
        <>
          {/* Billing strip: one honest line, one way out to the invoices. */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/30 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-primary">{P.billingStrip.label}</span>
              {" · "}
              {billing && billing.pendingTotalCents > 0
                ? P.billingStrip.outstanding(formatMoney(billing.pendingTotalCents))
                : P.billingStrip.square}
            </p>
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href="/workspace/invoices">{P.billingStrip.cta}</Link>
            </Button>
          </div>

          <div className="mt-10">
            <ProjectBody projectId={project.id} />
          </div>
        </>
      )}
    </div>
  );
}
