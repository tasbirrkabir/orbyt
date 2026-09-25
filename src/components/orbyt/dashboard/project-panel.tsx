"use client";

import Link from "next/link";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { PORTAL } from "@/content/flows";
import { PROCESS_STEPS } from "@/content/orbyt";
import { cn } from "@/lib/utils";
import type { MeProject, MeProjectUpdate } from "./types";

const COPY = PORTAL.projects;
const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

const STAGES: string[] = PROCESS_STEPS.map((step) => step.name);

/** Where in the six stage loop this project sits. Unknown status = step one. */
function stageIndex(status: string) {
  const index = STAGES.indexOf(status.toUpperCase());
  return index === -1 ? 0 : index;
}

function tagVariant(tag: string): "default" | "secondary" | "outline" {
  if (tag === "SHIPPED") return "default";
  if (tag === "IN PROGRESS") return "secondary";
  return "outline";
}

function UpdateRow({ update, index }: { update: MeProjectUpdate; index: number }) {
  return (
    <Reveal
      as="li"
      delay={0.05 * Math.min(index, 6)}
      y={14}
      className="relative flex gap-4 pb-5 last:pb-0"
    >
      <span
        aria-hidden="true"
        className="relative z-10 mt-1 size-3 shrink-0 border-2 border-primary bg-background"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Badge variant={tagVariant(update.tag)} className="font-mono text-[10px] tracking-[0.14em]">
            {update.tag}
          </Badge>
          <time
            dateTime={update.createdAt}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {format(new Date(update.createdAt), "MMM d, yyyy")}
          </time>
        </div>
        <h4 className="mt-2 font-display text-base font-bold leading-snug tracking-tight">
          {update.title}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {update.body}
        </p>
      </div>
    </Reveal>
  );
}

function ProjectCard({ project, index }: { project: MeProject; index: number }) {
  const reduced = useReducedMotion();
  const current = stageIndex(project.status);
  const startedAt = format(new Date(project.startedAt), "MMMM d, yyyy");

  return (
    <Reveal delay={0.06 * index}>
      <article className="border border-border bg-background/60 p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {COPY.projectLabel} {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1.5 font-display text-xl font-bold leading-tight tracking-tight">
              {project.title}
            </h3>
          </div>
          <Badge className="h-7 shrink-0 px-3 font-mono text-[10px] tracking-[0.16em]">
            {STAGES[current]} · {current + 1}/{STAGES.length}
          </Badge>
        </div>

        {/* Stage rail */}
        <div
          className="mt-5 grid grid-cols-6 gap-1.5"
          role="img"
          aria-label={`${COPY.stageLabel}: ${STAGES[current]}, ${current + 1} of ${STAGES.length}`}
        >
          {STAGES.map((stage, stageIdx) => (
            <span
              key={stage}
              title={stage}
              className={cn(
                "h-1.5 w-full",
                stageIdx < current && "bg-primary/55",
                stageIdx === current && "bg-primary",
                stageIdx > current && "bg-border"
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{STAGES[0]}</span>
          <span className="text-primary">{STAGES[current]}</span>
          <span>{STAGES[STAGES.length - 1]}</span>
        </div>

        {/* Meta */}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {COPY.startedLabel} {startedAt} · {project.updates.length}{" "}
          {COPY.updatesLabel}
        </p>

        {/* Updates timeline */}
        {project.updates.length > 0 ? (
          <div className="mt-5 max-h-[420px] overflow-y-auto border-t border-border pt-5 pr-1">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[5px] top-3 w-px bg-border"
              />
              {!reduced ? (
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-3 left-[5px] top-3 w-px origin-top bg-primary/70"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              ) : null}
              <ul role="list">
                {project.updates.map((update, updateIdx) => (
                  <UpdateRow key={update.id} update={update} index={updateIdx} />
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
            {COPY.empty}
          </p>
        )}
      </article>
    </Reveal>
  );
}

/**
 * The project portal: every engagement with its position in the six stage
 * loop and the crew's update feed. This is the screen clients log in for.
 */
export function ProjectPanel({ projects }: { projects: MeProject[] | null }) {
  const list = projects ?? [];

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <Reveal>
        <h2 className="font-display text-2xl font-bold tracking-tight">{COPY.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.sub}</p>
      </Reveal>

      {list.length > 0 ? (
        <div className="mt-6 flex flex-col gap-5">
          {list.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <Reveal className="mt-6 border-t border-border pt-5">
          <p className="font-display text-lg font-bold tracking-tight">
            {COPY.emptyTitle}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {COPY.empty}
          </p>
          <Button asChild className="mt-4 h-11 font-semibold">
            <Link href={COPY.emptyCta.href}>{COPY.emptyCta.label}</Link>
          </Button>
        </Reveal>
      )}
    </section>
  );
}
