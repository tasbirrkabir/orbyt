"use client";

import { motion, useReducedMotion } from "framer-motion";
import { COMMAND } from "@/content/command";
import { formatDate, formatMoney, STATUS_LABELS } from "@/lib/portal/domain";
import type { BillingPayload, InvoiceItem } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { StatusBadge } from "./status-badge";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer",
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Card",
};

function InvoiceRow({ invoice }: { invoice: InvoiceItem }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 px-5 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{invoice.number}</span>
          <StatusBadge status={invoice.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{invoice.description}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {COMMAND.billing.labels.issued} {formatDate(invoice.issueDate)} · {COMMAND.billing.labels.due}{" "}
          {formatDate(invoice.dueDate)}
          {invoice.paidAt
            ? ` · ${COMMAND.billing.labels.paidOn} ${formatDate(invoice.paidAt)}${
                invoice.method ? ` · ${METHOD_LABELS[invoice.method] ?? invoice.method}` : ""
              }`
            : ""}
        </p>
      </div>
      <p className="shrink-0 font-display text-lg font-bold tabular-nums">
        {formatMoney(invoice.totalCents, invoice.currency)}
      </p>
    </div>
  );
}

export function CommandBilling() {
  const { data, loading, failed, retry } = usePortalFetch<BillingPayload>("/api/portal/billing");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const nothingAtAll = data.pending.length === 0 && data.settled.length === 0;

  return (
    <div>
      <PageHeader eyebrow={COMMAND.billing.eyebrow} title={COMMAND.billing.title} sub={COMMAND.billing.sub} />

      <p className="mb-8 max-w-3xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {COMMAND.billing.honesty}
      </p>

      {nothingAtAll ? (
        <EmptyState title={COMMAND.billing.emptyTitle} body={COMMAND.billing.empty} />
      ) : (
        <>
          {/* Summary */}
          <motion.dl
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-10 grid gap-px border border-border bg-border sm:grid-cols-2"
          >
            <div className="bg-card/60 p-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {COMMAND.billing.summary.outstanding}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums">
                {formatMoney(data.outstandingCents)}
              </dd>
            </div>
            <div className="bg-card/60 p-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {COMMAND.billing.summary.paidThisYear}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-primary">
                {formatMoney(data.paidThisYearCents)}
              </dd>
            </div>
          </motion.dl>

          {/* Pending */}
          <section aria-label={COMMAND.billing.pending} className="mb-10">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {COMMAND.billing.pending}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {STATUS_LABELS.PENDING}
              </span>
            </div>
            {data.pending.length === 0 ? (
              <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm text-muted-foreground">
                {COMMAND.billing.emptyPending}
              </p>
            ) : (
              <div className="divide-y divide-border border border-border bg-card/50">
                {data.pending.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
                <p className="bg-muted/20 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
                  {COMMAND.billing.payNote}
                </p>
              </div>
            )}
          </section>

          {/* Settled */}
          <section aria-label={COMMAND.billing.settled}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.billing.settled}
            </h2>
            {data.settled.length === 0 ? (
              <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm text-muted-foreground">
                {COMMAND.billing.emptySettled}
              </p>
            ) : (
              <div className="divide-y divide-border border border-border bg-card/50">
                {data.settled.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
