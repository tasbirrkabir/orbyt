"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";
import { formatDate, PROJECT_TYPE_LABELS } from "@/lib/portal/domain";
import type { ProjectSummary } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader, ProgressBar } from "./primitives";
import { StatusBadge } from "./status-badge";
import { StageRail } from "./stage-rail";

const LABELS = COMMAND.projects.labels;

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>;
}

function ProjectCard({
  project,
  index,
  reduced,
}: {
  project: ProjectSummary;
  index: number;
  reduced: boolean | null;
}) {
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 * index, ease: "easeOut" }}
    >
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
            <p className="font-display text-2xl font-bold tabular-nums text-primary">{project.progress}%</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {LABELS.progress}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={project.progress} label={`${project.title} progress`} />
        </div>

        <div className="mt-5">
          <StageRail current={project.stage} compact />
        </div>

        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {LABELS.next}
            </dt>
            <dd className="mt-0.5 font-medium">{project.nextMilestone ?? "..."}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {LABELS.launch}
            </dt>
            <dd className="mt-0.5 font-medium">
              {project.targetLaunchAt ? formatDate(project.targetLaunchAt) : "..."}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <Button asChild size="sm" variant="outline">
            <Link href={`/workspace/projects/${project.id}`}>{LABELS.open}</Link>
          </Button>
        </div>
      </Panel>
    </motion.li>
  );
}

export function CommandProjects() {
  const { data, loading, failed, retry } = usePortalFetch<{ projects: ProjectSummary[] }>(
    "/api/portal/projects",
  );
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow={COMMAND.projects.eyebrow}
        title={COMMAND.projects.title}
        sub={COMMAND.projects.sub}
      />
      {data.projects.length === 0 ? (
        <EmptyState
          title={COMMAND.projects.emptyTitle}
          body={COMMAND.projects.empty}
          actionLabel={COMMAND.projects.emptyCta}
          actionHref="/contact"
        />
      ) : (
        <ul role="list" className="space-y-4">
          {data.projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} reduced={reduced} />
          ))}
        </ul>
      )}
    </div>
  );
}
