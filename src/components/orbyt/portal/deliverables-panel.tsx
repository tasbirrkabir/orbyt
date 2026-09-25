"use client";

import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Inbox, Timer } from "lucide-react";
import { PORTAL } from "@/content/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { cn } from "@/lib/utils";
import type { MeDeliverable } from "@/components/orbyt/dashboard/types";

const COPY = PORTAL.deliverables;

function DeliverableRow({
  deliverable,
  index,
  projectTitle,
}: {
  deliverable: MeDeliverable;
  index: number;
  projectTitle?: string;
}) {
  const reduced = useReducedMotion();
  const delivered = deliverable.status === "DELIVERED";

  return (
    <Reveal as="li" delay={0.05 * Math.min(index, 6)} y={14} className="pb-4 last:pb-0">
      <div
        className={cn(
          "border bg-background/60 p-4 transition-colors sm:p-5",
          delivered ? "border-border" : "border-dashed border-primary/40",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center border",
                delivered ? "border-border text-muted-foreground" : "border-primary/50 text-primary",
              )}
            >
              {delivered ? (
                <FileText className="size-4" />
              ) : (
                <Timer className="size-4" />
              )}
            </span>
            <div className="min-w-0">
              <h4 className="font-display text-base font-bold leading-snug tracking-tight">
                {deliverable.title}
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {deliverable.detail}
              </p>
            </div>
          </div>
          <Badge
            variant={delivered ? "default" : "outline"}
            className={cn(
              "h-7 shrink-0 px-3 font-mono text-[10px] tracking-[0.16em]",
              !delivered && "border-primary/50 text-primary",
            )}
          >
            {delivered ? COPY.sections.delivered.toUpperCase() : COPY.sections.inPrep.toUpperCase()}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Inbox aria-hidden="true" className="size-3.5" />
            {COPY.channelLabel}
          </span>
          {delivered && deliverable.deliveredAt ? (
            <time dateTime={deliverable.deliveredAt}>
              {COPY.deliveredOn} {format(new Date(deliverable.deliveredAt), "MMM d, yyyy")}
            </time>
          ) : null}
          {projectTitle ? <span>{projectTitle}</span> : null}
          {deliverable.link ? (
            <Button asChild variant="outline" size="sm" className="h-7 font-mono text-[10px] tracking-[0.16em]">
              <a href={deliverable.link} target="_blank" rel="noopener noreferrer">
                {COPY.openLabel}
              </a>
            </Button>
          ) : null}
        </div>

        {!delivered ? (
          <p className="mt-3 border-t border-dashed border-primary/30 pt-3 text-xs leading-relaxed text-muted-foreground">
            {COPY.inPrepNote}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}

/**
 * The deliverable index: what exists, in which state, delivered when.
 * Deliberately honest about transport: files ride email, the portal keeps
 * the record so nothing depends on one inbox or one person's memory.
 */
export function DeliverablesPanel({
  deliverables,
  projects,
}: {
  deliverables: MeDeliverable[];
  projects: { id: string; title: string }[];
}) {
  const reduced = useReducedMotion();
  const projectTitles = new Map(projects.map((project) => [project.id, project.title]));

  const inPrep = deliverables.filter((d) => d.status !== "DELIVERED");
  const delivered = deliverables.filter((d) => d.status === "DELIVERED");

  if (deliverables.length === 0) {
    return (
      <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
        <Reveal>
          <p className="font-display text-lg font-bold tracking-tight">{COPY.emptyTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.empty}</p>
        </Reveal>
      </section>
    );
  }

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      {inPrep.length > 0 ? (
        <>
          <Reveal>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {COPY.sections.inPrep} · {inPrep.length}
            </h3>
          </Reveal>
          <motion.ul
            role="list"
            className="mt-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {inPrep.map((deliverable, index) => (
              <DeliverableRow
                key={deliverable.id}
                deliverable={deliverable}
                index={index}
                projectTitle={
                  deliverable.projectId
                    ? projectTitles.get(deliverable.projectId)
                    : undefined
                }
              />
            ))}
          </motion.ul>
        </>
      ) : null}

      {delivered.length > 0 ? (
        <>
          <Reveal
            className={cn(inPrep.length > 0 && "mt-6 border-t border-border pt-6")}
          >
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {COPY.sections.delivered} · {delivered.length}
            </h3>
          </Reveal>
          <ul role="list" className="mt-4">
            {delivered.map((deliverable, index) => (
              <DeliverableRow
                key={deliverable.id}
                deliverable={deliverable}
                index={index}
                projectTitle={
                  deliverable.projectId
                    ? projectTitles.get(deliverable.projectId)
                    : undefined
                }
              />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
