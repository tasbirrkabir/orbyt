"use client";

import { useCallback, useEffect, useState } from "react";
import { InlineSpinner, RetryButton, StatCard, TierBadge, fmtDateTime, staffFetch, type StaffError } from "./admin-bits";
import { Button } from "@/components/ui/button";

/**
 * Overview tab: the one-glance ops picture. Counts come straight from
 * the database through /api/internal/overview; the deployment check
 * row reads the public /api/healthz endpoint, which reports only
 * machine facts (latency, storage roundtrip, outbox counters).
 */

type Overview = {
  leads: Record<string, number>;
  tenants: {
    count: number;
    recent: Array<{
      id: string; name: string; clientId: string; tier: string; createdAt: string;
      users: number; projects: number;
    }>;
  };
  projects: { count: number; health: Record<string, number>; needingAttention: number };
  work: {
    pendingApprovals: number;
    openRequests: number;
    proposedChangeRequests: Array<{
      id: string; code: string; title: string; raisedBy: string; raisedByName: string;
      createdAt: string; projectId: string; projectCode: string | null; projectTitle: string;
    }>;
  };
  email: Record<string, number>;
  audit: Array<{
    id: string; actorEmail: string; actorRole: string; action: string;
    targetType: string; targetLabel: string; createdAt: string;
  }>;
};

type Healthz = {
  status: string;
  checks: {
    db: { ok: boolean; latencyMs?: number };
    storage: { ok: boolean; provider?: string };
    email: { provider: string; outbox: { queued: number; sent: number; failed: number } };
  };
};

export function OverviewTab({ apiKey, onOpenProject }: { apiKey: string; onOpenProject: (projectId: string) => void }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [healthz, setHealthz] = useState<Healthz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, health] = await Promise.all([
        staffFetch<Overview>(apiKey, "/api/internal/overview"),
        fetch("/api/healthz").then((response) => (response.ok ? response.json() : null)).catch(() => null),
      ]);
      setOverview(data);
      setHealthz(health);
    } catch (caught) {
      setError((caught as StaffError).message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !overview) return <InlineSpinner label="Reading the ledger" />;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <RetryButton onClick={() => void load()} />
      </div>
    );
  }
  if (!overview) return null;

  const newLeads = overview.leads.NEW ?? 0;
  const failedEmails = overview.email.FAILED ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="New leads" value={newLeads} tone={newLeads > 0 ? "warn" : "neutral"} hint="Waiting for a first reply" />
        <StatCard label="Active tenants" value={overview.tenants.count} hint={`${overview.projects.count} projects total`} />
        <StatCard
          label="Projects needing attention"
          value={overview.projects.needingAttention}
          tone={overview.projects.needingAttention > 0 ? "danger" : "good"}
          hint="At risk, off track or on hold"
        />
        <StatCard
          label="Waiting on a decision"
          value={overview.work.pendingApprovals + overview.work.openRequests + overview.work.proposedChangeRequests.length}
          tone="warn"
          hint={`${overview.work.pendingApprovals} approvals · ${overview.work.openRequests} requests · ${overview.work.proposedChangeRequests.length} CRs`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Change requests awaiting a decision</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            Either side can raise; only the other side decides. ORBYT decides client-raised requests here.
          </p>
          <div className="mt-4 space-y-2">
            {overview.work.proposedChangeRequests.length === 0 ? (
              <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                Nothing waiting. Every raised change has been decided.
              </p>
            ) : (
              overview.work.proposedChangeRequests.map((cr) => (
                <button
                  key={cr.id}
                  type="button"
                  onClick={() => onOpenProject(cr.projectId)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-stone-200 p-3 text-left transition-colors hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      <span className="font-mono text-xs text-stone-500">{cr.code}</span> {cr.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {cr.projectTitle} · raised by {cr.raisedBy === "CLIENT" ? cr.raisedByName || "the client" : "ORBYT"} · {fmtDateTime(cr.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-amber-700">Decide →</span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Deployment check</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">Live from /api/healthz: database, storage roundtrip, outbound email.</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-stone-600">Database</dt>
              <dd className="font-medium text-stone-900">
                {healthz ? (healthz.checks.db.ok ? `OK · ${healthz.checks.db.latencyMs ?? "?"} ms` : "Down") : "No response"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-stone-600">Storage</dt>
              <dd className="font-medium text-stone-900">
                {healthz ? (healthz.checks.storage.ok ? `OK · ${healthz.checks.storage.provider ?? "local"}` : "Failing") : "No response"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-stone-600">Email provider</dt>
              <dd className="font-medium text-stone-900">{healthz ? healthz.checks.email.provider : "No response"}</dd>
            </div>
            {healthz ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-600">Outbox</dt>
                <dd className="font-medium text-stone-900">
                  {healthz.checks.email.outbox.sent} sent · {healthz.checks.email.outbox.queued} queued
                  {healthz.checks.email.outbox.failed > 0 ? (
                    <span className="text-red-700"> · {healthz.checks.email.outbox.failed} failed</span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            {failedEmails > 0 ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {failedEmails} email{failedEmails === 1 ? "" : "s"} recorded as FAILED. Delivery is a stored fact; check the mail provider.
              </p>
            ) : null}
          </dl>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Latest tenants</h3>
          <div className="mt-4 space-y-2">
            {overview.tenants.recent.length === 0 ? (
              <p className="text-sm text-stone-500">No tenants yet. Convert a lead or provision one from the Provision tab.</p>
            ) : (
              overview.tenants.recent.map((org) => (
                <div key={org.id} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">{org.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-stone-500">{org.clientId} · {org.users} user{org.users === 1 ? "" : "s"} · {org.projects} project{org.projects === 1 ? "" : "s"}</p>
                  </div>
                  <TierBadge tier={org.tier} />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Recent audit trail</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">Every staff call and security-relevant client action, newest first.</p>
          <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {overview.audit.length === 0 ? (
              <p className="text-sm text-stone-500">No audit entries yet.</p>
            ) : (
              overview.audit.map((row) => (
                <div key={row.id} className="rounded-lg border border-stone-100 px-3 py-2">
                  <p className="truncate font-mono text-xs text-stone-800">{row.action}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {row.actorRole} · {row.actorEmail}
                    {row.targetLabel ? ` · ${row.targetLabel}` : ""} · {fmtDateTime(row.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
