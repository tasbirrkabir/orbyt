"use client";

import { useState } from "react";
import Link from "next/link";
import { STAFF } from "@/content/admin";
import { TIERS, TIER_LABELS } from "@/lib/portal/domain";
import type { AdminOrgItem, AdminOrgsPayload } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/orbyt/command/primitives";
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
import { ChoiceField, TextField } from "./admin-kit";

const COPY = STAFF.clients;

/** Tier chip: mono meta, no color signal. The tier is a fact, not an alarm. */
function TierChip({ tier }: { tier: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {TIER_LABELS[tier] ?? tier}
    </span>
  );
}

function CountLine({ org }: { org: AdminOrgItem }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      <span>
        {COPY.colSeats} <span className="font-bold text-foreground">{org.userCount}</span>
      </span>
      <span>
        {COPY.colProjects} <span className="font-bold text-foreground">{org.projectCount}</span>
      </span>
      <span>
        {COPY.colQueue} <span className="font-bold text-foreground">{org.openRequests}</span>
      </span>
    </p>
  );
}

/**
 * The client roster. One row per engagement: portal key, tier, live
 * counts from the records. Creating an org issues the portal key and,
 * optionally, the owner seat in the same pass.
 */
export function AdminClients() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminOrgsPayload>("/api/admin/orgs");
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState<string>(TIERS[0]);
  const [country, setCountry] = useState("BD");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  function resetForm() {
    setName("");
    setTier(TIERS[0]);
    setCountry("BD");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerPassword("");
  }

  async function createOrg() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tier,
          country: country.trim().toUpperCase(),
          ...(ownerName.trim() ? { ownerName: ownerName.trim() } : {}),
          ...(ownerEmail.trim() ? { ownerEmail: ownerEmail.trim() } : {}),
          ...(ownerPassword ? { ownerPassword } : {}),
        }),
      });
      if (response.ok) {
        toast({ title: COPY.created });
        setCreateOpen(false);
        resetForm();
        refresh();
      } else {
        let message: string = STAFF.states.errorBody;
        try {
          const payload = (await response.json()) as { error?: string };
          if (typeof payload.error === "string" && payload.error) message = payload.error;
        } catch {
          // No JSON body; the fallback line stands.
        }
        toast({ title: message });
      }
    } catch {
      toast({ title: STAFF.states.errorBody });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            {COPY.create}
          </Button>
        }
      />

      {data.orgs.length === 0 ? (
        <EmptyState
          title={COPY.emptyTitle}
          body={COPY.empty}
          actionLabel={COPY.create}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <ul role="list" className="space-y-3">
          {data.orgs.map((org) => (
            <li
              key={org.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-border bg-card/50 p-5 transition-colors hover:border-primary/50"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-bold leading-tight">{org.name}</h2>
                  <span className="font-mono text-xs text-muted-foreground">{org.clientId}</span>
                  <TierChip tier={org.tier} />
                </div>
                <div className="mt-2">
                  <CountLine org={org} />
                </div>
              </div>
              <Link
                href={`/admin/clients/${org.id}`}
                aria-label={`${org.name} · ${COPY.open}`}
                className="inline-flex shrink-0 items-center gap-1 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {COPY.open}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{COPY.createTitle}</DialogTitle>
            <DialogDescription>{COPY.createSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void createOrg();
            }}
          >
            <TextField id="org-name" label={COPY.nameLabel} value={name} onChange={setName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <ChoiceField id="org-tier" label={COPY.tierLabel} value={tier} onChange={setTier} options={TIERS} />
              <TextField
                id="org-country"
                label={COPY.countryLabel}
                value={country}
                onChange={setCountry}
              />
            </div>
            <div className="space-y-4 border-t border-border pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {COPY.usersTitle}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="org-owner-name" label={COPY.ownerName} value={ownerName} onChange={setOwnerName} />
                <TextField
                  id="org-owner-email"
                  label={COPY.ownerEmail}
                  type="email"
                  value={ownerEmail}
                  onChange={setOwnerEmail}
                />
              </div>
              <TextField
                id="org-owner-password"
                label={COPY.ownerPassword}
                type="password"
                value={ownerPassword}
                onChange={setOwnerPassword}
                hint={COPY.ownerHint}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? COPY.creating : COPY.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
