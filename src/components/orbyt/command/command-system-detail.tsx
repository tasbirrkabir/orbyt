"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { formatDate, formatDateTime } from "@/lib/portal/domain";
import type { SystemDetailPayload } from "@/lib/portal/types";
import { StatusBadge } from "./status-badge";
import { ErrorState, LoadingState, Section } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";

const COPY = COMMAND.systems;
const LABELS = COPY.labels;
const DETAIL = COPY.detail;

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>
  );
}

/** The raw category, mono: AI, TRACKING, AUTOMATION. No translations needed. */
function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {category}
    </span>
  );
}

/** Empty section body: a dashed strip with one honest sentence. */
function EmptyStrip({ body }: { body: string }) {
  return (
    <div className="border border-dashed border-border bg-muted/30 px-6 py-8">
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

/**
 * One system: what it does (description, trigger, actions, connected
 * services), its recorded checks, and, for automations, the run
 * history. Everything here is a recorded fact; nothing is derived.
 */
export function CommandSystemDetail({ systemId }: { systemId: string }) {
  const reduced = useReducedMotion();
  const { data, loading, failed, retry } = usePortalFetch<SystemDetailPayload>(
    `/api/portal/systems/${systemId}`,
  );

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { system, checks, runs } = data;

  return (
    <div>
      <Link
        href="/workspace/systems"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <span aria-hidden="true">‹</span>
        {DETAIL.back}
      </Link>

      <motion.header
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-5"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {COPY.eyebrow}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {system.name}
          </h1>
          <CategoryChip category={system.category} />
          <StatusBadge status={system.status} />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {LABELS.owner}: {system.ownerLabel}
          {" · "}
          {system.lastCheckedAt ? (
            <time dateTime={system.lastCheckedAt}>
              {LABELS.lastChecked} {formatDate(system.lastCheckedAt)}
            </time>
          ) : (
            LABELS.never
          )}
        </p>
      </motion.header>

      {/* What it does */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        className="mt-6"
      >
        <Panel>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {LABELS.actions}
          </h2>
          {system.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed">{system.description}</p>
          ) : null}
          {system.trigger ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {LABELS.trigger}
              </p>
              <p className="mt-1 text-sm font-medium">{system.trigger}</p>
            </div>
          ) : null}
          {system.actions ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {system.actions}
              </p>
            </div>
          ) : null}
          {system.connected.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {LABELS.connected}
              </p>
              <ul role="list" className="mt-2 flex flex-wrap gap-2">
                {system.connected.map((service) => (
                  <li
                    key={service}
                    className="border border-border bg-muted/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>
      </motion.div>

      {/* Recorded checks */}
      <Section label={DETAIL.checks}>
        {checks.length === 0 ? (
          <EmptyStrip body={DETAIL.checksEmpty} />
        ) : (
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {checks.map((check) => (
              <li key={check.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-sm font-semibold">{check.name}</h3>
                  <StatusBadge status={check.status} />
                </div>
                {check.note ? (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {check.note}
                  </p>
                ) : null}
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <time dateTime={check.checkedAt}>{formatDateTime(check.checkedAt)}</time>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Run history: only automations have runs. */}
      <Section label={DETAIL.runs}>
        {runs.length === 0 ? (
          <EmptyStrip body={system.trigger ? DETAIL.runsEmpty : DETAIL.noAutomation} />
        ) : (
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:w-40">
                  <time dateTime={run.ranAt}>{formatDateTime(run.ranAt)}</time>
                </span>
                <StatusBadge status={run.status} className="shrink-0" />
                <p className="min-w-0 flex-1 text-sm leading-snug">{run.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
