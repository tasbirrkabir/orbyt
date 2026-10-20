"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  CalendarClock,
  CheckCheck,
  Inbox,
  MessageCircle,
  ReceiptText,
  Sparkles,
  Users,
} from "lucide-react";
import { STAFF } from "@/content/admin";
import { formatAge, formatDateTime, formatMoney } from "@/lib/portal/domain";
import type { AdminOverviewPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { LoadingState, ErrorState } from "@/components/orbyt/command/primitives";
import { cn } from "@/lib/utils";
import { AdminPanel, AttentionRow, StatCard } from "./admin-kit";

/**
 * The desk's opening screen, ordered by urgency: what needs you now
 * (only queues with a real count), then the shape of the business
 * (metrics), then the queues themselves, then the newest staff
 * actions. Every number is a real count from the records; empty
 * queues say so instead of rendering filler.
 */
export function AdminOverview() {
  const { data, loading, failed, retry } = usePortalFetch<AdminOverviewPayload>("/api/admin/overview");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { stats } = data;
  const A = STAFF.overview.attention;

  const attention = [
    { key: "requests", icon: Inbox, title: A.requests, sub: A.requestsSub, count: stats.openRequests, href: "/admin/requests", tone: "ember" as const },
    { key: "approvals", icon: CheckCheck, title: A.approvals, sub: A.approvalsSub, count: stats.pendingApprovals, href: "/admin/approvals", tone: "amber" as const },
    { key: "messages", icon: MessageCircle, title: A.messages, sub: A.messagesSub, count: stats.threadsAwaitingReply, href: "/admin/messages", tone: "ember" as const },
    { key: "billing", icon: ReceiptText, title: A.billing, sub: A.billingSub, count: stats.overdueInvoices, href: "/admin/billing", tone: "rose" as const },
    { key: "systems", icon: Activity, title: A.systems, sub: A.systemsSub, count: stats.systemsAttention, href: "/admin/systems", tone: "rose" as const },
  ].filter((row) => row.count > 0);

  const queueCard = (label: string, empty: string, items: { id: string; label: string; link: string; meta: string; organizationName: string }[], moreHref: string) => (
    <section aria-label={label}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</h2>
        {items.length > 0 ? (
          <Link
            href={moreHref}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {STAFF.overview.viewAll}
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul role="list" className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.link}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-card"
              >
                <span aria-hidden="true" className="h-8 w-0.5 shrink-0 rounded-full bg-primary/40 transition-colors group-hover:bg-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.label}</span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.organizationName} · {item.meta}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="min-w-0 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            {STAFF.overview.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {STAFF.shell.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {STAFF.overview.sub}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarClock className="size-3.5 text-primary" aria-hidden="true" />
          {formatDateTime(new Date())} · Asia/Dhaka
        </p>
      </motion.header>

      {/* Needs you now */}
      <section aria-label={A.label}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold tracking-tight">{A.label}</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">{A.sub}</p>
        </div>
        {attention.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-6">
            <p className="flex items-center gap-2 font-display text-base font-bold text-emerald-500">
              <CheckCheck className="size-4" aria-hidden="true" />
              {A.clear}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{A.clearSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {attention.map((row, index) => (
              <AttentionRow
                key={row.key}
                icon={row.icon}
                title={row.title}
                sub={row.sub}
                count={row.count}
                href={row.href}
                tone={row.tone}
                delay={index * 0.04}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shape of the business */}
      <section aria-label={STAFF.overview.stats.clients}>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          <StatCard icon={Users} label={STAFF.overview.stats.clients} value={String(stats.clients)} href="/admin/clients" delay={0} />
          <StatCard icon={Activity} label={STAFF.overview.stats.activeProjects} value={String(stats.activeProjects)} href="/admin/projects" delay={0.04} />
          <StatCard icon={ReceiptText} label={STAFF.overview.stats.outstanding} value={formatMoney(stats.outstandingCents)} href="/admin/billing" tone="amber" delay={0.08} />
          <StatCard
            icon={CalendarClock}
            label={STAFF.overview.stats.overdueInvoices}
            value={String(stats.overdueInvoices)}
            href="/admin/billing"
            tone={stats.overdueInvoices > 0 ? "rose" : "emerald"}
            hint={stats.overdueInvoices > 0 ? "Needs a nudge" : "All square"}
            delay={0.12}
          />
        </div>
      </section>

      {/* Queues */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:gap-6">
        {queueCard(STAFF.overview.approvalsLabel, STAFF.overview.emptyApprovals, data.approvals, "/admin/approvals")}
        {queueCard(STAFF.overview.requestsLabel, STAFF.overview.emptyRequests, data.requests, "/admin/requests")}
        {queueCard(STAFF.overview.threadsLabel, STAFF.overview.emptyThreads, data.threads, "/admin/messages")}

        {/* Audit tail */}
        <section aria-label={STAFF.overview.auditLabel}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {STAFF.overview.auditLabel}
            </h2>
            {data.audit.length > 0 ? (
              <Link
                href="/admin/activity"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {STAFF.overview.viewAll}
              </Link>
            ) : null}
          </div>
          {data.audit.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              {STAFF.overview.emptyAudit}
            </p>
          ) : (
            <AdminPanel className={cn("max-h-96 space-y-3 overflow-y-auto")}>
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
    </div>
  );
}
