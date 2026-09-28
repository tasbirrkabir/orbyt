"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { STAFF } from "@/content/admin";
import { formatAge, formatDateTime, formatMoney } from "@/lib/portal/domain";
import type { AdminOverviewPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { LoadingState, ErrorState } from "@/components/orbyt/command/primitives";
import { Stat, ListLabel, AdminPanel } from "./admin-kit";

/**
 * The desk's opening screen: live counts, the three queues, and the
 * newest staff actions. Every number is a real count from the records;
 * empty queues say so instead of rendering filler.
 */
export function AdminOverview() {
  const { data, loading, failed, retry } = usePortalFetch<AdminOverviewPayload>("/api/admin/overview");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { stats } = data;

  return (
    <div className="space-y-10">
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {STAFF.overview.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {STAFF.shell.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {STAFF.overview.sub}
        </p>
      </motion.header>

      {/* Counts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={STAFF.overview.stats.clients} value={String(stats.clients)} />
        <Stat label={STAFF.overview.stats.activeProjects} value={String(stats.activeProjects)} />
        <Stat
          label={STAFF.overview.stats.pendingApprovals}
          value={String(stats.pendingApprovals)}
        />
        <Stat label={STAFF.overview.stats.openRequests} value={String(stats.openRequests)} />
        <Stat
          label={STAFF.overview.stats.threadsAwaitingReply}
          value={String(stats.threadsAwaitingReply)}
        />
        <Stat label={STAFF.overview.stats.outstanding} value={formatMoney(stats.outstandingCents)} />
        <Stat
          label={STAFF.overview.stats.overdueInvoices}
          value={String(stats.overdueInvoices)}
          hint={stats.overdueInvoices > 0 ? "Needs a nudge" : undefined}
        />
        <Stat
          label={STAFF.overview.stats.systemsAttention}
          value={String(stats.systemsAttention)}
          hint={stats.systemsAttention > 0 ? "Recorded issues" : undefined}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
        {/* Approvals queue */}
        <section aria-label={STAFF.overview.approvalsLabel}>
          <ListLabel>{STAFF.overview.approvalsLabel}</ListLabel>
          {data.approvals.length === 0 ? (
            <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              {STAFF.overview.emptyApprovals}
            </p>
          ) : (
            <ul role="list" className="space-y-2">
              {data.approvals.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className="block border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.organizationName}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.meta}
                    </p>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/approvals"
                  className="inline-block pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {STAFF.overview.viewAll}
                </Link>
              </li>
            </ul>
          )}
        </section>

        {/* Requests queue */}
        <section aria-label={STAFF.overview.requestsLabel}>
          <ListLabel>{STAFF.overview.requestsLabel}</ListLabel>
          {data.requests.length === 0 ? (
            <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              {STAFF.overview.emptyRequests}
            </p>
          ) : (
            <ul role="list" className="space-y-2">
              {data.requests.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className="block border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.organizationName}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.meta}
                    </p>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/requests"
                  className="inline-block pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {STAFF.overview.viewAll}
                </Link>
              </li>
            </ul>
          )}
        </section>

        {/* Threads queue */}
        <section aria-label={STAFF.overview.threadsLabel}>
          <ListLabel>{STAFF.overview.threadsLabel}</ListLabel>
          {data.threads.length === 0 ? (
            <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              {STAFF.overview.emptyThreads}
            </p>
          ) : (
            <ul role="list" className="space-y-2">
              {data.threads.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className="block border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/50"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.organizationName}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.meta}
                    </p>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/messages"
                  className="inline-block pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {STAFF.overview.viewAll}
                </Link>
              </li>
            </ul>
          )}
        </section>

        {/* Audit tail */}
        <section aria-label={STAFF.overview.auditLabel}>
          <ListLabel>{STAFF.overview.auditLabel}</ListLabel>
          {data.audit.length === 0 ? (
            <p className="border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              {STAFF.overview.emptyAudit}
            </p>
          ) : (
            <AdminPanel className="max-h-96 space-y-3 overflow-y-auto">
              {data.audit.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">{row.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.targetLabel || row.targetType}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {formatAge(row.createdAt)}
                  </p>
                </div>
              ))}
            </AdminPanel>
          )}
        </section>
      </div>

      <p className="border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {formatDateTime(new Date())} · Asia/Dhaka
      </p>
    </div>
  );
}
