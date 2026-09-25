"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { formatDate } from "@/lib/portal/domain";
import type { SystemItem } from "@/lib/portal/types";
import { StatusBadge } from "./status-badge";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";

const COPY = COMMAND.systems;
const LABELS = COPY.labels;

type SystemsPayload = { systems: SystemItem[] };

/** The raw category, mono: AI, TRACKING, AUTOMATION. No translations needed. */
function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {category}
    </span>
  );
}

function SystemRow({ system, index }: { system: SystemItem; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.03 * Math.min(index, 8), ease: "easeOut" }}
    >
      <Link
        href={`/workspace/systems/${system.id}`}
        className="group block px-5 py-4 transition-colors hover:bg-accent/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display text-base font-bold leading-tight">{system.name}</h3>
              <CategoryChip category={system.category} />
              <StatusBadge status={system.status} />
            </div>
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {system.description}
            </p>
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {system.lastCheckedAt ? (
                <time dateTime={system.lastCheckedAt}>
                  {LABELS.lastChecked} {formatDate(system.lastCheckedAt)}
                </time>
              ) : (
                LABELS.never
              )}
              {" · "}
              {system.connectedCount} connected
            </p>
          </div>
          <span
            aria-hidden="true"
            className="mt-1 shrink-0 font-mono text-sm text-muted-foreground transition-colors group-hover:text-primary"
          >
            ›
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

/**
 * The Systems room: every piece of infrastructure ORBYT builds, runs
 * and monitors, with its recorded state. Each row opens its own detail.
 */
export function CommandSystems() {
  const { data, loading, failed, retry } = usePortalFetch<SystemsPayload>("/api/portal/systems");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      {data.systems.length === 0 ? (
        <EmptyState title={COPY.emptyTitle} body={COPY.empty} />
      ) : (
        <ul role="list" className="divide-y divide-border border border-border bg-card/50">
          {data.systems.map((system, index) => (
            <SystemRow key={system.id} system={system} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
