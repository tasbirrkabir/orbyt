"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PORTAL } from "@/content/flows";
import { formatDate } from "@/lib/portal/domain";
import type { DeliverablesPayload } from "@/lib/portal/types";
import { StatusBadge } from "./status-badge";
import { EmptyState, ErrorState, LoadingState, PageHeader, Section } from "./primitives";
import { usePortalFetch } from "./use-portal-fetch";
import { cn } from "@/lib/utils";

const COPY = PORTAL.deliverables;

type DeliverableRow = DeliverablesPayload["deliverables"][number];

/** The exact version on the index. */
function VersionChip({ version }: { version: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {version}
    </span>
  );
}

/** Still on the bench. Dashed border: not a handover yet, by design. */
function InPrepPanel({ item, index }: { item: DeliverableRow; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.03 * Math.min(index, 6), ease: "easeOut" }}
    >
      <div className="border border-dashed border-primary/40 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{item.title}</h3>
          <VersionChip version={item.version} />
        </div>
        {item.detail ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
        ) : null}
        {item.projectTitle ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {item.projectTitle}
          </p>
        ) : null}
        <p className="mt-3 border-t border-dashed border-primary/30 pt-3 text-xs leading-relaxed text-muted-foreground">
          {COPY.inPrepNote}
        </p>
      </div>
    </motion.li>
  );
}

/** Handed over. Email is the transport; this row is the record of it. */
function DeliveredPanel({ item, index }: { item: DeliverableRow; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.02 * Math.min(index, 8), ease: "easeOut" }}
      className="p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{item.title}</h3>
          <VersionChip version={item.version} />
        </div>
        <StatusBadge status={item.approvalState} />
      </div>

      {item.detail ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{item.channel === "EMAIL" ? COPY.channelLabel : item.channel}</span>
        {item.deliveredAt ? (
          <time dateTime={item.deliveredAt}>
            {COPY.deliveredOn} {formatDate(item.deliveredAt)}
          </time>
        ) : null}
        {item.projectTitle ? <span>{item.projectTitle}</span> : null}
        {/* The only link that renders is one that actually exists. */}
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.16em] text-primary",
              "underline-offset-4 transition-colors hover:underline",
            )}
          >
            {COPY.openLabel}
          </a>
        ) : null}
      </div>
    </motion.li>
  );
}

/**
 * The deliverables index, in the command center's visual language.
 * In-prep panels first (dashed, honest about timing), then the
 * delivered record: channel, date, project, version and approval
 * state. Files ride email; this page is the index, not the inbox.
 */
export function CommandDeliverables() {
  const { data, loading, failed, retry } = usePortalFetch<DeliverablesPayload>("/api/portal/deliverables");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const inPrep = data.deliverables.filter((item) => item.status !== "DELIVERED");
  const delivered = data.deliverables.filter((item) => item.status === "DELIVERED");

  return (
    <div>
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <p className="-mt-4 mb-8 max-w-2xl border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground sm:mb-10">
        {COPY.note}
      </p>

      {data.deliverables.length === 0 ? <EmptyState title={COPY.emptyTitle} body={COPY.empty} /> : null}

      {inPrep.length > 0 ? (
        <Section label={`${COPY.sections.inPrep} · ${inPrep.length}`} className={delivered.length === 0 ? "!mt-10" : undefined}>
          <ul role="list" className="space-y-4">
            {inPrep.map((item, index) => (
              <InPrepPanel key={item.id} item={item} index={index} />
            ))}
          </ul>
        </Section>
      ) : null}

      {delivered.length > 0 ? (
        <Section label={`${COPY.sections.delivered} · ${delivered.length}`}>
          <ul role="list" className="divide-y divide-border border border-border bg-card/50">
            {delivered.map((item, index) => (
              <DeliveredPanel key={item.id} item={item} index={index} />
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
