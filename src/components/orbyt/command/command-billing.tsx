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
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "./primitives";
import { StatusBadge } from "./status-badge";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer",
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Card",
};

const METHOD_OPTIONS = ["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"] as const;

function InvoiceRow({ invoice, onReport }: { invoice: InvoiceItem; onReport?: (invoice: InvoiceItem) => void }) {
  const canReport = Boolean(onReport) && ["PENDING", "OVERDUE"].includes(invoice.status);
  const claimed = (invoice.paymentClaimCount ?? 0) > 0 && !invoice.paidAt;
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{invoice.number}</span>
          <StatusBadge status={invoice.status} />
          {claimed ? (
            <span className="border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Payment reported · awaiting confirmation
            </span>
          ) : null}
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
      <div className="flex shrink-0 items-center gap-3">
        {canReport && onReport ? (
          <Button size="sm" variant="outline" onClick={() => onReport(invoice)}>
            Report payment
          </Button>
        ) : null}
        <p className="font-display text-lg font-bold tabular-nums">
          {formatMoney(invoice.totalCents, invoice.currency)}
        </p>
      </div>
    </div>
  );
}

export function CommandBilling() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<BillingPayload>("/api/portal/billing");
  const reduced = useReducedMotion();
  const [reporting, setReporting] = useState<InvoiceItem | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const nothingAtAll = data.pending.length === 0 && data.settled.length === 0;

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
                  <InvoiceRow key={invoice.id} invoice={invoice} onReport={openReport} />
                ))}
                <p className="bg-muted/20 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
                  {COMMAND.billing.payNote} Sent it already? Report the payment and ORBYT confirms receipt —
                  the invoice stays pending until a human on the crew records it.
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

      {/* Report payment dialog */}
      <Dialog open={reporting !== null} onOpenChange={(open) => { if (!open) setReporting(null); }}>
        <DialogContent className="sm:max-w-md">
          {reporting ? (
            <form onSubmit={(event) => void submitReport(event)}>
              <DialogHeader>
                <DialogTitle>Report a payment — {reporting.number}</DialogTitle>
                <DialogDescription>
                  {formatMoney(reporting.totalCents, reporting.currency)} · tells the crew money is on the way.
                  The invoice is marked paid only after ORBYT confirms receipt.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="claim-method">How did you pay?</Label>
                  <Select name="method" defaultValue="BANK_TRANSFER">
                    <SelectTrigger id="claim-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {METHOD_LABELS[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="claim-reference">Reference (transaction ID, transfer slip…)</Label>
                  <Input id="claim-reference" name="reference" maxLength={120} placeholder="Optional, but it helps" />
                </div>
              </div>
              {reportError ? <p className="mt-3 text-sm text-red-600">{reportError}</p> : null}
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={reportBusy}>
                  {reportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Report the payment
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
