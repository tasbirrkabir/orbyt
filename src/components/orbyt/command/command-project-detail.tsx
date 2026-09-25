"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMMAND } from "@/content/command";
import { PORTAL } from "@/content/flows";
import { CATEGORY_LABELS, formatDate, formatDateTime, PROJECT_TYPE_LABELS } from "@/lib/portal/domain";
import type { MilestoneItem, ProjectDetailPayload } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { usePortalFetch } from "./use-portal-fetch";
import { ErrorState, LoadingState, ProgressBar, Section } from "./primitives";
import { StatusBadge, statusGlyph } from "./status-badge";
import { StageRail } from "./stage-rail";

const LABELS = COMMAND.projects.labels;
const DETAIL = COMMAND.projects.detail;

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>;
}

function Dashed({ body }: { body: string }) {
  return (
    <Panel className="border-dashed bg-transparent">
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </Panel>
  );
}

/** BUILD -> "Build". Stage values are single words from a closed set. */
function stageLabel(stage: string): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

const GLYPH_TONE: Record<string, string> = {
  DONE: "border-primary/40 bg-primary/10 text-primary",
  ACTIVE: "border-border bg-foreground/[0.06] text-foreground/70",
  UPCOMING: "border-border bg-muted text-muted-foreground/70",
};
const GLYPH_FALLBACK = "border-border bg-muted text-muted-foreground/70";

function milestoneMeta(milestone: MilestoneItem): string {
  const date = formatDate(milestone.status === "DONE" ? (milestone.completedAt ?? milestone.dueDate) : milestone.dueDate);
  const state =
    milestone.status === "DONE"
      ? DETAIL.milestones.done
      : milestone.status === "ACTIVE"
        ? DETAIL.milestones.active
        : DETAIL.milestones.upcoming;
  return `${state} · ${date || "..."}`;
}

const TAG_TONE: Record<string, string> = {
  SHIPPED: "border-primary bg-primary text-[#1B1B1A]",
  "IN PROGRESS": "border-border bg-muted text-muted-foreground",
  NOTE: "border-border bg-transparent text-foreground",
};
const TAG_FALLBACK = "border-border bg-transparent text-foreground";

export function CommandProjectDetail({ projectId }: { projectId: string }) {
  const { data, loading, failed, retry, refresh } = usePortalFetch<ProjectDetailPayload>(
    `/api/portal/projects/${encodeURIComponent(projectId)}`,
  );
  const reduced = useReducedMotion();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState(false);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { project } = data;

  const approveUpdate = async (updateId: string) => {
    setApprovingId(updateId);
    setApproveError(false);
    try {
      const response = await fetch(`/api/portal/updates/${encodeURIComponent(updateId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acknowledged: true }),
      });
      if (!response.ok) throw new Error("request failed");
      refresh();
    } catch {
      setApproveError(true);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Link
          href="/workspace/projects"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <span aria-hidden="true">←</span>
          {DETAIL.back}
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {project.title}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {project.code ? `${project.code} · ` : ""}
          {PROJECT_TYPE_LABELS[project.type] ?? project.type}
        </p>
      </motion.header>

      {/* Goal */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      >
        <Panel>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {DETAIL.goalLabel}
          </p>
          {project.goal ? (
            <p className="mt-2 font-display text-base font-bold leading-snug tracking-tight">
              {project.goal}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DETAIL.noGoal}</p>
          )}
        </Panel>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="max-w-full">
            <TabsTrigger value="overview">{DETAIL.tabs.overview}</TabsTrigger>
            <TabsTrigger value="milestones">{DETAIL.tabs.milestones}</TabsTrigger>
            <TabsTrigger value="updates">{DETAIL.tabs.updates}</TabsTrigger>
            <TabsTrigger value="deliverables">{DETAIL.tabs.deliverables}</TabsTrigger>
            <TabsTrigger value="files">{DETAIL.tabs.files}</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {LABELS.progress}
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-primary">{project.progress}%</p>
            </div>
            <div className="mt-3">
              <ProgressBar value={project.progress} label={`${project.title} progress`} />
            </div>
            <div className="mt-5">
              <StageRail current={project.stage} />
            </div>
            <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {LABELS.stage}
                </dt>
                <dd className="mt-0.5 font-medium">{stageLabel(project.stage)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {LABELS.started}
                </dt>
                <dd className="mt-0.5 font-medium">{formatDate(project.startedAt)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {LABELS.launch}
                </dt>
                <dd className="mt-0.5 font-medium">
                  {project.targetLaunchAt ? formatDate(project.targetLaunchAt) : "..."}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {LABELS.owner}
                </dt>
                <dd className="mt-0.5 font-medium">{project.ownerLabel}</dd>
              </div>
            </dl>
          </Panel>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-6">
          <Section
            label={DETAIL.milestones.label}
            sub={data.milestones.length > 0 ? DETAIL.milestones.sub : undefined}
            className="!mt-0"
          >
            {data.milestones.length === 0 ? (
              <Dashed body={DETAIL.milestones.sub} />
            ) : (
              <ol role="list">
                {data.milestones.map((milestone, index) => (
                  <li key={milestone.id} className="relative flex gap-3.5 pb-7 last:pb-0">
                    {index < data.milestones.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[13px] top-9 w-px bg-border"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center border font-mono text-xs leading-none",
                        GLYPH_TONE[milestone.status] ?? GLYPH_FALLBACK,
                      )}
                    >
                      {statusGlyph(milestone.status)}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold leading-snug">{milestone.title}</p>
                      {milestone.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {milestone.description}
                        </p>
                      ) : null}
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {milestoneMeta(milestone)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </TabsContent>

        {/* Crew log */}
        <TabsContent value="updates" className="mt-6">
          <Section
            label={DETAIL.updates.label}
            sub={data.updates.length > 0 ? DETAIL.updates.sub : undefined}
            className="!mt-0"
          >
            {approveError ? (
              <p role="status" className="mb-4 border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                {PORTAL.approve.error}
              </p>
            ) : null}
            {data.updates.length === 0 ? (
              <Dashed body={DETAIL.updates.sub} />
            ) : (
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {data.updates.map((update, index) => (
                  <motion.li
                    key={update.id}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.03 * index, ease: "easeOut" }}
                    className="px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                          TAG_TONE[update.tag] ?? TAG_FALLBACK,
                        )}
                      >
                        {update.tag}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {formatDateTime(update.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-snug">{update.title}</p>
                    {update.body ? (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{update.body}</p>
                    ) : null}
                    {update.tag === "SHIPPED" ? (
                      update.acknowledgedAt ? (
                        <p className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          <span aria-hidden="true" className="text-primary">✓</span>
                          {DETAIL.updates.approved} · {formatDate(update.acknowledgedAt)}
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <p className="text-xs text-muted-foreground">{DETAIL.updates.awaiting}</p>
                          <Button
                            size="sm"
                            onClick={() => void approveUpdate(update.id)}
                            disabled={approvingId === update.id}
                          >
                            {approvingId === update.id ? DETAIL.updates.approving : DETAIL.updates.approve}
                          </Button>
                        </div>
                      )
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        {/* Deliverables */}
        <TabsContent value="deliverables" className="mt-6">
          <Section label={DETAIL.deliverables.label} className="!mt-0">
            {data.deliverables.length === 0 ? (
              <Dashed body={DETAIL.deliverables.empty} />
            ) : (
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {data.deliverables.map((deliverable) => (
                  <li
                    key={deliverable.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{deliverable.title}</p>
                        {deliverable.version ? (
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {deliverable.version}
                          </span>
                        ) : null}
                      </div>
                      {deliverable.detail ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {deliverable.detail}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                      <StatusBadge status={deliverable.approvalState} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {deliverable.deliveredAt ? formatDate(deliverable.deliveredAt) : "IN PREP"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        {/* Files */}
        <TabsContent value="files" className="mt-6">
          <Section label={DETAIL.files.label} className="!mt-0">
            {data.files.length === 0 ? (
              <Dashed body={DETAIL.files.empty} />
            ) : (
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {data.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {CATEGORY_LABELS[file.category] ?? file.category} · {file.sizeKb} KB
                      </p>
                    </div>
                    <StatusBadge status={file.status} className="shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
