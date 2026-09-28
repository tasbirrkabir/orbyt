"use client";

import { motion, useReducedMotion } from "framer-motion";
import { STAFF } from "@/content/admin";
import { formatDate } from "@/lib/portal/domain";
import type { AdminApprovalItem, AdminApprovalsPayload } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { ListLabel } from "./admin-kit";

const COPY = STAFF.approvals;

/** The closed set behind Approval.type: what kind of thing is signed off. */
const TYPE_LABELS: Record<string, string> = {
  DELIVERABLE: "Deliverable",
  COPY: "Copy",
  CREATIVE: "Creative",
  DOCUMENT: "Document",
};

/** The exact version on record. Ember while it waits, quiet once decided. */
function VersionChip({ version, pending = false }: { version: string; pending?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        pending ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground",
      )}
    >
      {version}
    </span>
  );
}

/**
 * One sign-off across tenants. Read only by design: the decision
 * belongs to the client, the desk reads the record.
 */
function ApprovalRow({ item, index }: { item: AdminApprovalItem; index: number }) {
  const reduced = useReducedMotion();
  const context = [item.projectTitle, item.deliverableTitle].filter(Boolean).join(" · ");
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: "easeOut" }}
      className="border border-border bg-card/50 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {item.organizationName} · {item.clientId}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold leading-tight">{item.title}</h3>
            <VersionChip version={item.version} pending={item.status === "PENDING"} />
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {TYPE_LABELS[item.type] ?? item.type}
          </p>
          {context ? (
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {context}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          {/* A client decision is a record, not a toggle: the badge is the whole UI. */}
          <StatusBadge status={item.status} />
          <time
            dateTime={item.submittedAt}
            className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {COPY.submitted} {formatDate(item.submittedAt)}
          </time>
          {item.decidedAt ? (
            <time
              dateTime={item.decidedAt}
              className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {COPY.decided} {formatDate(item.decidedAt)}
            </time>
          ) : null}
        </div>
      </div>
      {item.decisionComment ? (
        <p className="mt-3 border-l-2 border-border pl-3 text-sm italic leading-relaxed text-muted-foreground">
          {`"${item.decisionComment}"`}
        </p>
      ) : null}
    </motion.li>
  );
}

/**
 * Every sign-off across clients. Waiting first, then the decided
 * record. No action buttons: approvals are client decisions.
 */
export function AdminApprovals() {
  const { data, loading, failed, retry } = usePortalFetch<AdminApprovalsPayload>("/api/admin/approvals");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const waiting = data.approvals.filter((item) => item.status === "PENDING");
  const decided = data.approvals.filter((item) => item.status !== "PENDING");

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={COPY.eyebrow} title={COPY.title} sub={COPY.sub} />

      <section aria-label={COPY.waiting}>
        <ListLabel>
          {COPY.waiting} · {waiting.length}
        </ListLabel>
        {waiting.length === 0 ? (
          <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            {COPY.emptyWaiting}
          </p>
        ) : (
          <ul role="list" className="space-y-3">
            {waiting.map((item, index) => (
              <ApprovalRow key={item.id} item={item} index={index} />
            ))}
          </ul>
        )}
      </section>

      <section aria-label={COPY.onRecord}>
        <ListLabel>
          {COPY.onRecord} · {decided.length}
        </ListLabel>
        {decided.length === 0 ? (
          <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            {COPY.emptyDecided}
          </p>
        ) : (
          <ul role="list" className="space-y-3">
            {decided.map((item, index) => (
              <ApprovalRow key={item.id} item={item} index={index} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
