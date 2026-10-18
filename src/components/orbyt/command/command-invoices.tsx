"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMAND } from "@/content/command";
import { formatDate, formatMoney, STATUS_LABELS } from "@/lib/portal/domain";
import type { BillingPayload, InvoiceItem } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { StatusBadge } from "./status-badge";

const B = COMMAND.invoices;

const METHOD_OPTIONS = ["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"] as const;

function InvoiceRow({ invoice, onReport }: { invoice: InvoiceItem; onReport?: (invoice: InvoiceItem) => void }) {
  const canReport = Boolean(onReport) && ["PENDING", "OVERDUE"].includes(invoice.status);
  const claimed = (invoice.paymentClaimCount ?? 0) > 0 && !invoice.paidAt;
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-x-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{invoice.number}</span>
          <StatusBadge status={invoice.status} />
          {claimed ? (
            <span className="border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {B.reported}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{invoice.description}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {B.labels.issued} {formatDate(invoice.issueDate)} · {B.labels.due} {formatDate(invoice.dueDate)}
          {invoice.paidAt
            ? ` · ${B.labels.paidOn} ${formatDate(invoice.paidAt)}${
                invoice.method ? ` · ${B.methods[invoice.method] ?? invoice.method}` : ""
              }`
            : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        {canReport && onReport ? (
          <Button size="sm" variant="outline" onClick={() => onReport(invoice)}>
            {B.reportCta}
          </Button>
        ) : null}
        <p className="font-display text-lg font-bold tabular-nums">
          {formatMoney(invoice.totalCents, invoice.currency)}
        </p>
      </div>
    </div>
  );
}

/**
 * The Invoices room: invoice details in the open, the way payment
 * actually works at ORBYT, and the report-payment loop. The portal
 * never processes a payment; a human confirms every receipt.
 */
export function CommandInvoices() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<BillingPayload>("/api/portal/billing");
  const reduced = useReducedMotion();
  const [reporting, setReporting] = useState<InvoiceItem | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const nothingAtAll = data.pending.length === 0 && data.settled.length === 0;
  const canWrite = data.identity.canWrite;

  function openReport(invoice: InvoiceItem) {
    setReporting(invoice);
    setReportError(null);
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reporting || reportBusy) return;
    const form = new FormData(event.currentTarget);
    setReportBusy(true);
    setReportError(null);
    try {
      const response = await fetch(`/api/portal/billing/${reporting.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: String(form.get("method") ?? "BANK_TRANSFER"),
          reference: String(form.get("reference") ?? "").trim(),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setReportError(payload.error ?? "That did not go through. Try again.");
        return;
      }
      setReporting(null);
      refresh();
    } catch {
      setReportError("Network trouble. Try again.");
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow={B.eyebrow} title={B.title} sub={B.sub} />

      {/* How payment works: the honest three steps. */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10 border border-border bg-card/50 p-5"
      >
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{B.how.title}</h2>
        <ol role="list" className="mt-3 space-y-2.5">
          {B.how.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center border font-mono text-[10px]",
                  index === 2 ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </motion.div>

      {nothingAtAll ? (
        <EmptyState title={B.emptyTitle} body={B.empty} />
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
                {B.summary.outstanding}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums">
                {formatMoney(data.outstandingCents)}
              </dd>
            </div>
            <div className="bg-card/60 p-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {B.summary.paidThisYear}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-primary">
                {formatMoney(data.paidThisYearCents)}
              </dd>
            </div>
          </motion.dl>

          {/* Due */}
          <section aria-label={B.pending} className="mb-10">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {B.pending}
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {STATUS_LABELS.PENDING}
              </span>
            </div>
            {data.pending.length === 0 ? (
              <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm text-muted-foreground">
                {B.emptyPending}
              </p>
            ) : (
              <div className="divide-y divide-border border border-border bg-card/50">
                {data.pending.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} onReport={canWrite ? openReport : undefined} />
                ))}
                <p className="bg-muted/20 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
                  {B.payNote}
                </p>
              </div>
            )}
            {!canWrite && data.pending.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{B.viewerNote}</p>
            ) : null}
          </section>

          {/* Settled */}
          <section aria-label={B.settled}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {B.settled}
            </h2>
            {data.settled.length === 0 ? (
              <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm text-muted-foreground">
                {B.emptySettled}
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

      {/* Report payment dialog */}
      <Dialog open={reporting !== null} onOpenChange={(open) => { if (!open) setReporting(null); }}>
        <DialogContent className="sm:max-w-md">
          {reporting ? (
            <form onSubmit={(event) => void submitReport(event)}>
              <DialogHeader>
                <DialogTitle>{B.reportDialog.title} — {reporting.number}</DialogTitle>
                <DialogDescription>
                  {B.reportDialog.description(formatMoney(reporting.totalCents, reporting.currency), reporting.number)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="claim-method">{B.reportDialog.methodLabel}</Label>
                  <Select name="method" defaultValue="BANK_TRANSFER">
                    <SelectTrigger id="claim-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {B.methods[method] ?? method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="claim-reference">{B.reportDialog.referenceLabel}</Label>
                  <Input id="claim-reference" name="reference" maxLength={120} placeholder={B.reportDialog.referencePlaceholder} />
                </div>
              </div>
              {reportError ? <p className="mt-3 text-sm text-red-600">{reportError}</p> : null}
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={reportBusy}>
                  {reportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {B.reportDialog.submit}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
