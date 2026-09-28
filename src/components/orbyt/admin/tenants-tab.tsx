"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CircleDollarSign, FileText, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ConsoleSection,
  CopyChip,
  EmptyNote,
  HealthBadge,
  InlineSpinner,
  RetryButton,
  StatCard,
  TierBadge,
  WorkBadge,
  fmtDate,
  fmtDateTime,
  staffFetch,
  type StaffError,
} from "./admin-bits";

/**
 * Tenants tab: the serving surface. Pick a tenant, see everything the
 * client can see, and act on it — answer conversations, triage
 * requests, ask for sign-off, publish deliverables, share files,
 * invoice, record payments (including confirming what a client
 * reported), and run meetings. Every action lands in the client's
 * activity ledger and usually rings their bell, so the loop closes
 * visibly on both sides.
 */

type TenantListTenant = {
  id: string;
  name: string;
  clientId: string;
  tier: string;
  createdAt: string;
  users: Array<{ id: string; name: string; email: string }>;
  projects: Array<{
    id: string; code: string; title: string; status: string; health: string;
    targetLaunchAt: string | null;
  }>;
  attention: {
    needsReply: number;
    pendingApprovals: number;
    openRequests: number;
    dueInvoices: number;
    dueInvoiceTotalCents: number;
  };
};

type Plate = {
  organization: { id: string; name: string; clientId: string; tier: string; country: string; createdAt: string };
  users: Array<{ id: string; name: string; email: string; role: string; lastLoginAt: string | null }>;
  projects: Array<{
    id: string; code: string; title: string; type: string; status: string; stage: string;
    health: string; healthNote: string; healthUpdatedAt: string | null; progress: number;
    targetLaunchAt: string | null;
  }>;
  threads: Array<{
    id: string; subject: string; context: string; projectId: string | null; projectTitle: string | null;
    updatedAt: string; needsReply: boolean; unreadForClient: number;
    messages: Array<{ id: string; senderName: string; senderRole: string; body: string; readByClient: boolean; createdAt: string }>;
  }>;
  requests: Array<{
    id: string; code: string; title: string; category: string; priority: string; status: string;
    description: string; createdAt: string; updatedAt: string;
    comments: Array<{ authorName: string; authorRole: string; body: string; createdAt: string }>;
  }>;
  approvals: Array<{
    id: string; title: string; type: string; version: string; status: string; description: string;
    submittedAt: string; decidedAt: string | null; decisionComment: string;
    project: { id: string; title: string } | null;
  }>;
  deliverables: Array<{
    id: string; title: string; status: string; approvalState: string; version: string;
    category: string; deliveredAt: string | null; link: string | null;
  }>;
  files: Array<{ id: string; name: string; kind: string; status: string; category: string; note: string; uploadedAt: string; link: string | null }>;
  invoices: Array<{
    id: string; number: string; issueDate: string; dueDate: string; description: string;
    totalCents: number; currency: string; status: string; paidAt: string | null; method: string;
    payments: Array<{ id: string; amountCents: number; method: string; reference: string; paidAt: string }>;
  }>;
  meetings: Array<{
    id: string; title: string; startsAt: string; durationMins: number; agenda: string;
    status: string; notes: string; decisions: string;
  }>;
  activity: Array<{ id: string; type: string; title: string; actorName: string; actorRole: string; createdAt: string }>;
  counts: {
    needsReply: number; pendingApprovals: number; openRequests: number;
    dueInvoices: number; dueInvoiceTotalCents: number; claimedPayments: number; unreadForClient: number;
  };
};

const REQUEST_STATUS_OPTIONS = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "COMPLETED", "CLOSED"] as const;
const PAYMENT_METHODS = ["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"] as const;
const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer", BKASH: "bKash", NAGAD: "Nagad", CARD: "Card",
};

function money(cents: number, currency = "BDT"): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 });
}

function AttentionChips({ attention }: { attention: TenantListTenant["attention"] }) {
  const chips: Array<{ label: string; count: number }> = [
    { label: "to answer", count: attention.needsReply },
    { label: "sign-offs", count: attention.pendingApprovals },
    { label: "requests", count: attention.openRequests },
    { label: "due", count: attention.dueInvoices },
  ];
  const live = chips.filter((chip) => chip.count > 0);
  if (live.length === 0) return <span className="text-xs text-emerald-700">All quiet</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {live.map((chip) => (
        <Badge key={chip.label} variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-900">
          {chip.count} {chip.label}
        </Badge>
      ))}
    </span>
  );
}

export function TenantsTab({ apiKey, onOpenProject }: { apiKey: string; onOpenProject: (projectId: string) => void }) {
  const [tenants, setTenants] = useState<TenantListTenant[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plate, setPlate] = useState<Plate | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateLoading, setPlateLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  // Dialog state: one shared "create" dialog with a kind switch.
  const [dialog, setDialog] = useState<
    | { kind: "approval" }
    | { kind: "deliverable" }
    | { kind: "invoice" }
    | { kind: "meeting" }
    | { kind: "payment"; invoiceId: string; number: string }
    | null
  >(null);

  const loadList = useCallback(async () => {
    setListError(null);
    try {
      const data = await staffFetch<{ tenants: TenantListTenant[] }>(apiKey, "/api/internal/tenants");
      setTenants(data.tenants);
      setSelectedId((current) => current ?? data.tenants[0]?.id ?? null);
    } catch (caught) {
      setListError((caught as StaffError).message);
    }
  }, [apiKey]);

  const loadPlate = useCallback(
    async (id: string, quiet = false) => {
      if (!quiet) setPlateLoading(true);
      setPlateError(null);
      try {
        const data = await staffFetch<Plate>(apiKey, `/api/internal/tenants/${id}`);
        setPlate(data);
      } catch (caught) {
        setPlateError((caught as StaffError).message);
      } finally {
        setPlateLoading(false);
      }
    },
    [apiKey],
  );

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadPlate(selectedId);
  }, [selectedId, loadPlate]);

  async function serve(body: Record<string, unknown>, note: string): Promise<boolean> {
    if (actionBusy) return false;
    setActionBusy(true);
    setActionError(null);
    setActionNote(null);
    try {
      await staffFetch(apiKey, "/api/internal/serve", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setActionNote(note);
      if (selectedId) {
        await Promise.all([loadPlate(selectedId, true), loadList()]);
      }
      return true;
    } catch (caught) {
      setActionError((caught as StaffError).message);
      return false;
    } finally {
      setActionBusy(false);
    }
  }

  const list = tenants ?? [];
  const selected = list.find((tenant) => tenant.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)]">
      {/* Tenant roster */}
      <div className="min-w-0 space-y-2">
        {listError ? (
          <div className="space-y-2">
            <p className="text-sm text-red-700">{listError}</p>
            <RetryButton onClick={() => void loadList()} />
          </div>
        ) : tenants === null ? (
          <InlineSpinner label="Loading tenants" />
        ) : list.length === 0 ? (
          <EmptyNote>No tenants yet. Convert a lead or provision one.</EmptyNote>
        ) : (
          list.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              onClick={() => setSelectedId(tenant.id)}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                tenant.id === selectedId
                  ? "border-stone-900 bg-white shadow-sm"
                  : "border-stone-200 bg-white/60 hover:bg-white"
              }`}
            >
              <p className="truncate text-sm font-semibold text-stone-900">{tenant.name}</p>
              <p className="mt-0.5 font-mono text-xs text-stone-500">{tenant.clientId}</p>
              <div className="mt-2">
                <AttentionChips attention={tenant.attention} />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Tenant plate */}
      <div className="min-w-0 space-y-4">
        {!selectedId ? (
          <EmptyNote>Pick a tenant on the left to serve them.</EmptyNote>
        ) : plateLoading && !plate ? (
          <InlineSpinner label="Reading the tenant plate" />
        ) : plateError ? (
          <div className="space-y-2">
            <p className="text-sm text-red-700">{plateError}</p>
            <RetryButton onClick={() => void loadPlate(selectedId)} />
          </div>
        ) : plate ? (
          <>
            {/* Header + attention */}
            <ConsoleSection
              title={plate.organization.name}
              description={`${plate.users.length} user${plate.users.length === 1 ? "" : "s"} · ${plate.projects.length} project${plate.projects.length === 1 ? "" : "s"} · onboarded ${fmtDate(plate.organization.createdAt)}`}
              aside={
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={plate.organization.tier} />
                  <CopyChip value={plate.organization.clientId} />
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&>*]:min-w-0">
                <StatCard label="To answer" value={plate.counts.needsReply} tone={plate.counts.needsReply > 0 ? "warn" : "good"} hint="Client spoke last" />
                <StatCard label="Sign-offs pending" value={plate.counts.pendingApprovals} tone={plate.counts.pendingApprovals > 0 ? "warn" : "neutral"} />
                <StatCard label="Open requests" value={plate.counts.openRequests} tone={plate.counts.openRequests > 0 ? "warn" : "neutral"} />
                <StatCard label="Invoices due" value={plate.counts.dueInvoices} tone={plate.counts.dueInvoices > 0 ? "warn" : "good"} hint={money(plate.counts.dueInvoiceTotalCents)} />
              </div>
              {plate.counts.claimedPayments > 0 ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {plate.counts.claimedPayments} invoice{plate.counts.claimedPayments === 1 ? "" : "s"} ha{plate.counts.claimedPayments === 1 ? "s" : "ve"} a client-reported payment awaiting confirmation. Check Billing below.
                </p>
              ) : null}
              {actionNote ? (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{actionNote}</p>
              ) : null}
              {actionError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{actionError}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "approval" })}>Ask for sign-off</Button>
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "deliverable" })}>Publish deliverable</Button>
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "invoice" })}>
                  <CircleDollarSign className="h-3.5 w-3.5" /> New invoice
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "meeting" })}>Schedule meeting</Button>
              </div>
              {actionBusy ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Working…
                </p>
              ) : null}
            </ConsoleSection>

            {/* Projects strip */}
            <ConsoleSection title="Projects" description="Recorded health and progress. Manage the contract in the Projects tab.">
              {plate.projects.length === 0 ? (
                <EmptyNote>No projects yet.</EmptyNote>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {plate.projects.map((project) => (
                    <div key={project.id} className="min-w-0 rounded-lg border border-stone-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-stone-900">{project.title}</p>
                          <p className="font-mono text-xs text-stone-500">{project.code} · {project.progress}%</p>
                        </div>
                        <HealthBadge health={project.health} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={() => onOpenProject(project.id)}
                      >
                        Manage in Projects →
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Conversations */}
            <ConsoleSection
              title="Conversations"
              description="Reply as ORBYT. The client sees the reply as unread in their Messages and on the home screen."
            >
              {plate.threads.length === 0 ? (
                <EmptyNote>No conversations yet.</EmptyNote>
              ) : (
                <div className="space-y-2">
                  {plate.threads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      busy={actionBusy}
                      onReply={(body) =>
                        void serve({ action: "message.reply", threadId: thread.id, body }, `Reply sent on “${thread.subject}”.`)
                      }
                    />
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Requests */}
            <ConsoleSection
              title="Requests"
              description="Triage tickets: reply to the client and move the status. A reply on a SUBMITTED ticket moves it to REVIEWING."
            >
              {plate.requests.length === 0 ? (
                <EmptyNote>No requests filed.</EmptyNote>
              ) : (
                <div className="space-y-2">
                  {plate.requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      busy={actionBusy}
                      onReply={(body) =>
                        void serve({ action: "request.reply", requestId: request.id, body }, `Reply posted on ${request.code}.`)
                      }
                      onStatus={(status) =>
                        void serve({ action: "request.status", requestId: request.id, status }, `${request.code} moved to ${status.replace(/_/g, " ").toLowerCase()}.`)
                      }
                    />
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Approvals */}
            <ConsoleSection title="Approvals" description="Sign-offs you have asked for and what the client decided.">
              {plate.approvals.length === 0 ? (
                <EmptyNote>No approvals yet. Use “Ask for sign-off” above.</EmptyNote>
              ) : (
                <div className="space-y-2">
                  {plate.approvals.map((approval) => (
                    <div key={approval.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-stone-200 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">{approval.title}</p>
                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {approval.project?.title ?? "No project"} · v{approval.version.replace(/^v/i, "")} · asked {fmtDate(approval.submittedAt)}
                          {approval.decidedAt ? ` · decided ${fmtDate(approval.decidedAt)}` : ""}
                        </p>
                        {approval.decisionComment ? (
                          <p className="mt-1 text-xs italic text-stone-600">“{approval.decisionComment}”</p>
                        ) : null}
                      </div>
                      <WorkBadge status={approval.status} />
                    </div>
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Deliverables & files */}
            <div className="grid gap-4 lg:grid-cols-2 [&>section]:min-w-0">
              <ConsoleSection title="Deliverables" description="What has landed, and its review state.">
                {plate.deliverables.length === 0 ? (
                  <EmptyNote>Nothing delivered yet.</EmptyNote>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {plate.deliverables.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-stone-900">
                            <FileText className="mr-1.5 inline h-3.5 w-3.5 text-stone-400" />
                            {deliverable.title}
                          </p>
                          <p className="font-mono text-xs text-stone-500">
                            {deliverable.version} · {deliverable.approvalState.toLowerCase()}
                            {deliverable.deliveredAt ? ` · ${fmtDate(deliverable.deliveredAt)}` : ""}
                          </p>
                        </div>
                        <WorkBadge status={deliverable.status} />
                      </div>
                    ))}
                  </div>
                )}
              </ConsoleSection>

              <ConsoleSection title="Files" description="The shared index. Links open for the client; rows without one are metadata only.">
                {plate.files.length === 0 ? (
                  <EmptyNote>No files shared yet.</EmptyNote>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {plate.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2">
                        <p className="min-w-0 truncate text-sm text-stone-900">{file.name}</p>
                        <span className="shrink-0 font-mono text-xs text-stone-500">{file.status.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ConsoleSection>
            </div>

            {/* Billing */}
            <ConsoleSection title="Billing" description="Issue invoices, confirm client-reported payments, record receipts. Money becomes PAID only through a human here.">
              {plate.invoices.length === 0 ? (
                <EmptyNote>No invoices yet. Use “New invoice” above.</EmptyNote>
              ) : (
                <div className="space-y-2">
                  {plate.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-stone-200 p-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-stone-500">{invoice.number}</span>
                          <WorkBadge status={invoice.status} />
                          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && invoice.payments.length > 0 ? (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-900">
                              client reported {invoice.payments.length} payment{invoice.payments.length === 1 ? "" : "s"}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {invoice.description} · due {fmtDate(invoice.dueDate)}
                          {invoice.payments.length > 0
                            ? ` · ${invoice.payments.map((payment) => `${METHOD_LABELS[payment.method] ?? payment.method}${payment.reference ? ` (${payment.reference})` : ""}`).join(", ")}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="font-display text-sm font-semibold tabular-nums text-stone-900">{money(invoice.totalCents, invoice.currency)}</p>
                        {["PENDING", "OVERDUE"].includes(invoice.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionBusy}
                            onClick={() => setDialog({ kind: "payment", invoiceId: invoice.id, number: invoice.number })}
                          >
                            Record payment
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Meetings */}
            <ConsoleSection title="Meetings" description="Upcoming and past, with notes and decisions the client can read.">
              {plate.meetings.length === 0 ? (
                <EmptyNote>No meetings scheduled. Use “Schedule meeting” above.</EmptyNote>
              ) : (
                <div className="space-y-2">
                  {plate.meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      busy={actionBusy}
                      onClose={(notes, decisions) =>
                        void serve({ action: "meeting.close", meetingId: meeting.id, notes, decisions }, `“${meeting.title}” closed with notes.`)
                      }
                    />
                  ))}
                </div>
              )}
            </ConsoleSection>

            {/* Ledger */}
            <ConsoleSection title="Recent ledger" description="What both sides did, newest first — the same story the client sees.">
              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {plate.activity.length === 0 ? (
                  <p className="text-sm text-stone-500">Nothing yet.</p>
                ) : (
                  plate.activity.map((event) => (
                    <div key={event.id} className="rounded-lg border border-stone-100 px-3 py-2">
                      <p className="text-sm text-stone-800">{event.title}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {event.actorRole === "CLIENT" ? event.actorName : "ORBYT crew"} · {fmtDateTime(event.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ConsoleSection>
          </>
        ) : null}
      </div>

      {/* Dialogs */}
      {plate && dialog?.kind === "approval" ? (
        <CreateDialog
          title="Ask for sign-off"
          description="Creates a pending approval the client decides from their home screen or Approvals room."
          busy={actionBusy}
          onClose={() => setDialog(null)}
          onSubmit={async (form) => {
            const ok = await serve(
              {
                action: "approval.create",
                projectId: form.get("projectId"),
                title: form.get("title"),
                description: form.get("description") ?? undefined,
                version: form.get("version") ?? undefined,
              },
              "Sign-off requested. It is on the client's home screen now.",
            );
            if (!ok) throw new Error("Could not create the approval. The reason is shown behind this dialog.");
          }}
        >
          <ProjectSelect projects={plate.projects} />
          <Field label="What needs approval"><Input name="title" required minLength={3} maxLength={160} placeholder="Homepage design, v2" /></Field>
          <Field label="Context (optional)"><Textarea name="description" rows={3} maxLength={2000} placeholder="What is attached, what to look at." /></Field>
          <Field label="Version (optional)"><Input name="version" maxLength={20} placeholder="v2" /></Field>
        </CreateDialog>
      ) : null}

      {plate && dialog?.kind === "deliverable" ? (
        <CreateDialog
          title="Publish a deliverable"
          description="Marks work as DELIVERED today. The client sees it in Deliverables and the activity ledger."
          busy={actionBusy}
          onClose={() => setDialog(null)}
          onSubmit={async (form) => {
            const link = String(form.get("link") ?? "").trim();
            const ok = await serve(
              {
                action: "deliverable.publish",
                projectId: form.get("projectId"),
                title: form.get("title"),
                detail: form.get("detail") ?? undefined,
                link: link || undefined,
              },
              "Deliverable published.",
            );
            if (!ok) throw new Error("Could not publish the deliverable. The reason is shown behind this dialog.");
          }}
        >
          <ProjectSelect projects={plate.projects} />
          <Field label="Title"><Input name="title" required minLength={3} maxLength={160} placeholder="Brand guidelines, final" /></Field>
          <Field label="What it is (optional)"><Textarea name="detail" rows={3} maxLength={1000} placeholder="One or two honest sentences." /></Field>
          <Field label="Link (optional, must be a real client-reachable URL)"><Input name="link" type="url" maxLength={500} placeholder="https://…" /></Field>
        </CreateDialog>
      ) : null}

      {plate && dialog?.kind === "invoice" ? (
        <CreateDialog
          title="New invoice"
          description={`Numbered automatically for ${plate.organization.clientId}. The client sees it under Billing immediately.`}
          busy={actionBusy}
          onClose={() => setDialog(null)}
          onSubmit={async (form) => {
            const subtotal = Math.round(Number(form.get("amount") ?? 0) * 100);
            const tax = Math.round(Number(form.get("tax") ?? 0) * 100);
            const ok = await serve(
              {
                action: "invoice.create",
                organizationId: plate.organization.id,
                description: form.get("description"),
                dueDate: form.get("dueDate"),
                subtotalCents: Number.isFinite(subtotal) ? subtotal : 0,
                taxCents: Number.isFinite(tax) ? tax : 0,
              },
              "Invoice issued and visible to the client.",
            );
            if (!ok) throw new Error("Could not issue the invoice. The reason is shown behind this dialog.");
          }}
        >
          <Field label="Description"><Input name="description" required minLength={3} maxLength={300} placeholder="Phase 2 — build, 50%" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Amount"><Input name="amount" type="number" min="0" step="0.01" required placeholder="45000" /></Field>
            <Field label="Tax (optional)"><Input name="tax" type="number" min="0" step="0.01" placeholder="0" /></Field>
          </div>
          <Field label="Due date"><Input name="dueDate" type="date" required /></Field>
        </CreateDialog>
      ) : null}

      {plate && dialog?.kind === "meeting" ? (
        <CreateDialog
          title="Schedule a meeting"
          description="Lands in the client's Meetings and on their home screen as Next up."
          busy={actionBusy}
          onClose={() => setDialog(null)}
          onSubmit={async (form) => {
            const startsAt = String(form.get("startsAt") ?? "");
            const ok = await serve(
              {
                action: "meeting.schedule",
                organizationId: plate.organization.id,
                title: form.get("title"),
                startsAt: new Date(startsAt).toISOString(),
                durationMins: Number(form.get("duration") ?? 30),
                agenda: form.get("agenda") ?? undefined,
              },
              "Meeting scheduled.",
            );
            if (!ok) throw new Error("Could not schedule the meeting. The reason is shown behind this dialog.");
          }}
        >
          <Field label="Title"><Input name="title" required minLength={3} maxLength={160} placeholder="Weeknote review" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Starts at"><Input name="startsAt" type="datetime-local" required /></Field>
            <Field label="Minutes"><Input name="duration" type="number" min="15" max="480" step="15" defaultValue={30} /></Field>
          </div>
          <Field label="Agenda (optional)"><Textarea name="agenda" rows={3} maxLength={2000} placeholder="What you will cover." /></Field>
        </CreateDialog>
      ) : null}

      {plate && dialog?.kind === "payment" ? (
        <CreateDialog
          title={`Record payment — ${dialog.number}`}
          description="Confirms money actually received. This marks the invoice PAID and tells the client."
          busy={actionBusy}
          onClose={() => setDialog(null)}
          onSubmit={async (form) => {
            const ok = await serve(
              {
                action: "invoice.markPaid",
                invoiceId: dialog.invoiceId,
                method: form.get("method"),
                reference: form.get("reference") ?? undefined,
              },
              `${dialog.number} marked paid.`,
            );
            if (!ok) throw new Error("Could not record the payment. The reason is shown behind this dialog.");
          }}
        >
          <Field label="Method">
            <Select name="method" defaultValue="BANK_TRANSFER">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{METHOD_LABELS[method]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reference (optional)"><Input name="reference" maxLength={120} placeholder="Transaction ID, slip number" /></Field>
        </CreateDialog>
      ) : null}
    </div>
  );
}

// ── Small local pieces ──────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-stone-500">{label}</Label>
      {children}
    </div>
  );
}

function ProjectSelect({ projects }: { projects: Plate["projects"] }) {
  if (projects.length === 0) {
    return <p className="text-xs text-stone-500">This tenant has no projects yet.</p>;
  }
  return (
    <Field label="Project">
      <Select name="projectId" defaultValue={projects[0].id}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.code} · {project.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function CreateDialog({
  title,
  description,
  busy,
  children,
  onClose,
  onSubmit,
}: {
  title: string;
  description: string;
  busy: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (form: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setError(null);
            try {
              await onSubmit(new FormData(event.currentTarget));
              onClose();
            } catch (caught) {
              setError((caught as Error).message);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">{children}</div>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <Send className="h-3.5 w-3.5" /> Do it
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ThreadCard({
  thread,
  busy,
  onReply,
}: {
  thread: Plate["threads"][number];
  busy: boolean;
  onReply: (body: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  return (
    <div className={`rounded-lg border p-3 ${thread.needsReply ? "border-amber-300 bg-amber-50/40" : "border-stone-200"}`}>
      <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen((value) => !value)}>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">{thread.subject}</p>
          <p className="mt-0.5 truncate text-xs text-stone-500">
            {thread.projectTitle ? `${thread.projectTitle} · ` : ""}
            {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} · last {fmtDateTime(thread.messages[thread.messages.length - 1]?.createdAt)}
          </p>
        </div>
        <span className="flex shrink-0 gap-1">
          {thread.needsReply ? <Badge variant="outline" className="border-amber-300 bg-amber-100 text-[10px] text-amber-900">needs reply</Badge> : null}
          {thread.unreadForClient > 0 ? <Badge variant="outline" className="border-stone-300 text-[10px] text-stone-600">{thread.unreadForClient} unread by client</Badge> : null}
        </span>
      </button>
      {open ? (
        <div className="mt-3 space-y-2">
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-md bg-stone-50 p-2">
            {thread.messages.map((message) => (
              <div key={message.id} className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${message.senderRole === "CLIENT" ? "bg-white" : "bg-stone-800 text-white"}`}>
                <p className="text-xs opacity-70">{message.senderRole === "CLIENT" ? message.senderName : "ORBYT · " + message.senderName}</p>
                <p className="mt-0.5 whitespace-pre-wrap">{message.body}</p>
              </div>
            ))}
          </div>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            maxLength={4000}
            placeholder="Reply as ORBYT…"
            disabled={busy}
          />
          <Button size="sm" disabled={busy || body.trim().length < 2} onClick={() => { onReply(body.trim()); setBody(""); }}>
            <Send className="h-3.5 w-3.5" /> Send reply
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function RequestCard({
  request,
  busy,
  onReply,
  onStatus,
}: {
  request: Plate["requests"][number];
  busy: boolean;
  onReply: (body: string) => void;
  onStatus: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const lastComment = request.comments[request.comments.length - 1];
  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpen((value) => !value)}>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">
            <span className="font-mono text-xs text-stone-500">{request.code}</span> {request.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-500">
            {request.category.toLowerCase()} · {request.priority.toLowerCase()} · updated {fmtDateTime(request.updatedAt)}
            {lastComment ? ` · last: ${lastComment.authorRole === "CLIENT" ? "client" : "ORBYT"} said “${lastComment.body.slice(0, 60)}”` : ""}
          </p>
        </div>
        <WorkBadge status={request.status} />
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <p className="whitespace-pre-wrap rounded-md bg-stone-50 p-3 text-sm text-stone-700">{request.description}</p>
          {request.comments.length > 0 ? (
            <div className="max-h-40 space-y-1.5 overflow-y-auto">
              {request.comments.map((comment, index) => (
                <p key={index} className="text-xs text-stone-600">
                  <span className="font-medium text-stone-800">{comment.authorRole === "CLIENT" ? comment.authorName : "ORBYT · " + comment.authorName}</span>{" "}
                  {comment.body}
                </p>
              ))}
            </div>
          ) : null}
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={2} maxLength={4000} placeholder="Reply to the client…" disabled={busy} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={busy || body.trim().length < 2} onClick={() => { onReply(body.trim()); setBody(""); }}>
              <Send className="h-3.5 w-3.5" /> Post reply
            </Button>
            <Select value={request.status} onValueChange={(value) => onStatus(value)} disabled={busy}>
              <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REQUEST_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MeetingCard({
  meeting,
  busy,
  onClose,
}: {
  meeting: Plate["meetings"][number];
  busy: boolean;
  onClose: (notes: string, decisions: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [decisions, setDecisions] = useState("");
  const upcoming = meeting.status === "UPCOMING";
  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">{meeting.title}</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {fmtDateTime(meeting.startsAt)} · {meeting.durationMins} min{meeting.agenda ? ` · ${meeting.agenda}` : ""}
          </p>
          {meeting.notes ? <p className="mt-1 text-xs italic text-stone-600">Notes: {meeting.notes}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <WorkBadge status={meeting.status} />
          {upcoming ? (
            <Button size="sm" variant="outline" onClick={() => setOpen((value) => !value)} disabled={busy}>
              Close out
            </Button>
          ) : null}
        </div>
      </div>
      {open && upcoming ? (
        <div className="mt-3 space-y-2">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} maxLength={4000} placeholder="What was discussed…" disabled={busy} />
          <Input value={decisions} onChange={(event) => setDecisions(event.target.value)} maxLength={2000} placeholder="Decisions made (optional)" disabled={busy} />
          <Button size="sm" disabled={busy || notes.trim().length < 2} onClick={() => { onClose(notes.trim(), decisions.trim()); setOpen(false); }}>
            Save notes & close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
