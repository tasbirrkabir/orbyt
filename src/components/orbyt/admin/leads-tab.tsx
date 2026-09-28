"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  CopyChip,
  EmptyNote,
  InlineSpinner,
  LeadBadge,
  RetryButton,
  fmtDate,
  staffFetch,
  type StaffError,
} from "./admin-bits";

/**
 * Leads tab: the working funnel. Every inbound contact is a lead with
 * a stored status; staff move leads forward or convert them into full
 * tenants. Conversion returns the client ID and the one-time
 * activation link, and ORBYT has already emailed the invite.
 */

type Lead = {
  id: string;
  name: string;
  email: string;
  topic: string | null;
  status: string;
  messagePreview: string;
  convertedOrganizationId: string | null;
  createdAt: string;
};

type LeadsResponse = { ok: true; counts: Record<string, number>; leads: Lead[] };

type ConvertResult = {
  ok: true;
  clientId: string;
  organizationId: string;
  activationUrl: string;
  inviteExpiresAt: string;
};

const FILTERS = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"] as const;

export function LeadsTab({ apiKey }: { apiKey: string }) {
  const { toast } = useToast();
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffFetch<LeadsResponse>(apiKey, "/api/lifecycle/leads?limit=200");
      setData(response);
    } catch (caught) {
      setError((caught as StaffError).message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(lead: Lead, status: string) {
    setPendingId(lead.id);
    try {
      await staffFetch(apiKey, `/api/lifecycle/leads/${lead.id}`, {
        method: "POST",
        body: JSON.stringify({ action: "status", status }),
      });
      toast({ title: `${lead.name} marked ${status.toLowerCase()}` });
      await load();
    } catch (caught) {
      toast({ title: "Could not update the lead", description: (caught as StaffError).message, variant: "destructive" });
    } finally {
      setPendingId(null);
    }
  }

  async function convert(lead: Lead) {
    setPendingId(lead.id);
    try {
      const response = await staffFetch<ConvertResult>(apiKey, `/api/lifecycle/leads/${lead.id}`, {
        method: "POST",
        body: JSON.stringify({ action: "convert", tier: "WEBSITE_ONLY" }),
      });
      setResult(response);
      await load();
    } catch (caught) {
      toast({ title: "Conversion failed", description: (caught as StaffError).message, variant: "destructive" });
    } finally {
      setPendingId(null);
    }
  }

  if (loading && !data) return <InlineSpinner label="Loading the funnel" />;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">{error}</p>
        <RetryButton onClick={() => void load()} />
      </div>
    );
  }
  if (!data) return null;

  const visible = data.leads.filter((lead) => {
    if (filter !== "ALL" && lead.status !== filter) return false;
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      return (
        lead.name.toLowerCase().includes(needle) ||
        lead.email.toLowerCase().includes(needle) ||
        (lead.topic ?? "").toLowerCase().includes(needle)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((key) => {
          const count = key === "ALL" ? data.leads.length : data.counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === key
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
        <div className="ml-auto w-full sm:w-56">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, topic"
            className="h-9 bg-white"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyNote>
          {data.leads.length === 0
            ? "No leads yet. Every website contact form submission lands here."
            : "No leads match this filter."}
        </EmptyNote>
      ) : (
        <div className="max-h-[36rem] space-y-2 overflow-y-auto pr-1">
          {visible.map((lead) => (
            <article key={lead.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{lead.name}</p>
                    <LeadBadge status={lead.status} />
                    <span className="text-xs text-stone-400">{fmtDate(lead.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    {lead.email}
                    {lead.topic ? ` · ${lead.topic}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{lead.messagePreview}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {pendingId === lead.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                  ) : lead.status === "CONVERTED" ? (
                    <span className="text-xs text-stone-400">Tenant created</span>
                  ) : (
                    <>
                      {lead.status === "NEW" ? (
                        <Button size="sm" variant="outline" onClick={() => void setStatus(lead, "CONTACTED")}>
                          Mark contacted
                        </Button>
                      ) : null}
                      {lead.status === "CONTACTED" ? (
                        <Button size="sm" variant="outline" onClick={() => void setStatus(lead, "QUALIFIED")}>
                          Qualify
                        </Button>
                      ) : null}
                      {lead.status === "NEW" || lead.status === "CONTACTED" || lead.status === "QUALIFIED" ? (
                        <Button size="sm" onClick={() => void convert(lead)}>
                          Convert to client
                        </Button>
                      ) : null}
                      {lead.status !== "ARCHIVED" ? (
                        <Button size="sm" variant="ghost" className="text-stone-400" onClick={() => void setStatus(lead, "ARCHIVED")}>
                          Archive
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={result !== null} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tenant created</DialogTitle>
            <DialogDescription>
              The organization and owner account exist. The invite email is on its way; the activation link is single use and expires {fmtDate(result?.inviteExpiresAt)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-stone-500">Client ID (needed at every login)</Label>
              <div className="mt-1.5">
                {result ? <CopyChip value={result.clientId} /> : null}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-stone-500">One-time activation link</Label>
              <div className="mt-1.5">
                {result ? <CopyChip value={result.activationUrl} label={result.activationUrl.replace(/^https?:\/\//, "")} /> : null}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-500">
              The raw link lives only in this response and the email. Store the client ID somewhere safe: support needs it to help this tenant sign in.
            </p>
            <Button className="w-full" onClick={() => setResult(null)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
