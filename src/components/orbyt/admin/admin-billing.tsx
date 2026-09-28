"use client";

import { useState } from "react";
import { STAFF } from "@/content/admin";
import { formatDate, formatMoney } from "@/lib/portal/domain";
import type { AdminInvoiceItem, AdminInvoicesPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/orbyt/command/primitives";
import { StatusBadge } from "@/components/orbyt/command/status-badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChoiceField, Field, OrgSelect, TextField, dateToInput, inputToIso } from "./admin-kit";

const COPY = STAFF.billing;
const STATES = STAFF.states;

/** The closed payment method set the API accepts. */
const PAYMENT_METHODS = ["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"] as const;

/**
 * One mutation helper for the room. Success answers { ok: true }; any
 * failure surfaces the API's own error line verbatim in a toast, so
 * the desk always reads the same words the server wrote.
 */
async function sendJson(
  url: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; error: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true, error: "" };
    let message: string = STATES.errorBody;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error) message = payload.error;
    } catch {
      // No JSON body; the fallback line stands.
    }
    return { ok: false, error: message };
  } catch {
    return { ok: false, error: STATES.errorBody };
  }
}

function IssueInvoiceDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [issueDate, setIssueDate] = useState(() => dateToInput(new Date().toISOString()));
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [subtotalTaka, setSubtotalTaka] = useState("");
  const [taxTaka, setTaxTaka] = useState("0");

  const subtotal = Number(subtotalTaka);
  const tax = Number(taxTaka);
  const canSubmit =
    orgId !== "" &&
    issueDate !== "" &&
    dueDate !== "" &&
    dueDate >= issueDate &&
    description.trim().length >= 3 &&
    subtotalTaka.trim() !== "" &&
    Number.isFinite(subtotal) &&
    subtotal >= 0 &&
    Number.isFinite(tax) &&
    tax >= 0;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    const result = await sendJson("/api/admin/invoices", "POST", {
      organizationId: orgId,
      issueDate: inputToIso(issueDate),
      dueDate: inputToIso(dueDate),
      description: description.trim(),
      subtotalTaka: subtotal,
      taxTaka: tax,
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.issued });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{COPY.newTitle}</DialogTitle>
          <DialogDescription>{COPY.sub}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field id="invoice-add-org" label={COPY.clientLabel}>
            <OrgSelect id="invoice-add-org" value={orgId} onChange={setOrgId} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="invoice-add-issue"
              label={COPY.issueLabel}
              type="date"
              value={issueDate}
              onChange={setIssueDate}
            />
            <TextField
              id="invoice-add-due"
              label={COPY.dueLabel}
              type="date"
              value={dueDate}
              onChange={setDueDate}
            />
          </div>
          <TextField
            id="invoice-add-desc"
            label={COPY.descLabel}
            value={description}
            onChange={setDescription}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="invoice-add-subtotal"
              label={COPY.subtotalLabel}
              type="number"
              min="0"
              step="0.01"
              value={subtotalTaka}
              onChange={setSubtotalTaka}
            />
            <TextField
              id="invoice-add-tax"
              label={COPY.taxLabel}
              type="number"
              min="0"
              step="0.01"
              value={taxTaka}
              onChange={setTaxTaka}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={!canSubmit || busy} onClick={submit}>
            {busy ? COPY.creating : COPY.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({
  invoice,
  onClose,
  onDone,
}: {
  invoice: AdminInvoiceItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<string>("BANK_TRANSFER");
  const [reference, setReference] = useState("");

  async function submit() {
    if (busy) return;
    setBusy(true);
    const result = await sendJson(`/api/admin/invoices/${invoice.id}`, "PATCH", {
      payment: { method, reference: reference.trim() },
    });
    setBusy(false);
    if (result.ok) {
      toast({ title: COPY.paid });
      onDone();
    } else {
      toast({ title: result.error });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{COPY.paidTitle}</DialogTitle>
          <DialogDescription>
            {invoice.number} · {formatMoney(invoice.totalCents)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ChoiceField
            id="invoice-pay-method"
            label={COPY.methodLabel}
            value={method}
            onChange={setMethod}
            options={PAYMENT_METHODS}
          />
          <TextField
            id="invoice-pay-reference"
            label={COPY.referenceLabel}
            value={reference}
            onChange={setReference}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            {STATES.cancel}
          </Button>
          <Button size="sm" disabled={busy} onClick={submit}>
            {busy ? COPY.recording : COPY.recordBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ROW_GRID =
  "lg:grid lg:grid-cols-[1.1fr_0.8fr_1.6fr_0.8fr_0.9fr_1fr_auto] lg:items-start lg:gap-3";

function InvoiceRow({
  invoice,
  onPay,
}: {
  invoice: AdminInvoiceItem;
  onPay: () => void;
}) {
  const paid = invoice.status === "PAID";
  return (
    <li className={`p-4 ${ROW_GRID}`}>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {invoice.organizationName} · {invoice.clientId}
        </p>
      </div>
      <p className="mt-2 font-mono text-xs text-foreground lg:mt-0">{invoice.number}</p>
      <p className="mt-2 text-sm leading-relaxed lg:mt-0">{invoice.description}</p>
      <p className="mt-2 text-sm font-medium tabular-nums lg:mt-0">{formatMoney(invoice.totalCents)}</p>
      <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground lg:mt-0">
        {formatDate(invoice.dueDate)}
      </p>
      <div className="mt-2 lg:mt-0">
        <StatusBadge status={invoice.status} />
        {paid && invoice.paidAt ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {invoice.method} · {formatDate(invoice.paidAt)}
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex lg:mt-0 lg:justify-end">
        {!paid ? (
          <Button size="sm" variant="outline" onClick={onPay}>
            {COPY.markPaid}
          </Button>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Invoices and payments across tenants. Amounts are recorded money in
 * taka (stored as integer cents); a payment is the desk writing down
 * money that moved outside the portal, never money moving inside it.
 */
export function AdminBilling() {
  const { data, loading, failed, retry, refresh } =
    usePortalFetch<AdminInvoicesPayload>("/api/admin/invoices");
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<AdminInvoiceItem | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            {COPY.newInvoice}
          </Button>
        }
      />

      <section aria-label={COPY.title}>
        {data.invoices.length === 0 ? (
          <EmptyState
            title={COPY.title}
            body={COPY.empty}
            actionLabel={COPY.newInvoice}
            onAction={() => setCreating(true)}
          />
        ) : (
          <div>
            <div className="hidden px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground lg:grid lg:grid-cols-[1.1fr_0.8fr_1.6fr_0.8fr_0.9fr_1fr_auto] lg:gap-3">
              <span>{COPY.colClient}</span>
              <span>{COPY.colNumber}</span>
              <span>{COPY.colDescription}</span>
              <span>{COPY.colTotal}</span>
              <span>{COPY.colDue}</span>
              <span>{COPY.colStatus}</span>
              <span aria-hidden="true" />
            </div>
            <ul role="list" className="divide-y divide-border border border-border bg-card/50">
              {data.invoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} onPay={() => setPaying(invoice)} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {creating ? (
        <IssueInvoiceDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refresh();
          }}
        />
      ) : null}
      {paying ? (
        <RecordPaymentDialog
          invoice={paying}
          onClose={() => setPaying(null)}
          onDone={() => {
            setPaying(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}
