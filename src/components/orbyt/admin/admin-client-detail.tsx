"use client";

import { useState } from "react";
import Link from "next/link";
import { STAFF, STAFF_NAV_ITEMS } from "@/content/admin";
import { ROLES, ROLE_LABELS, TIERS, formatDate, formatMoney } from "@/lib/portal/domain";
import type { AdminOrgDetailPayload, AdminUserItem } from "@/lib/admin/types";
import { usePortalFetch } from "@/components/orbyt/command/use-portal-fetch";
import { LoadingState, ErrorState, PageHeader } from "@/components/orbyt/command/primitives";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPanel, ChoiceField, ListLabel, Stat, TextField } from "./admin-kit";

const COPY = STAFF.clients;
const PROJECTS = STAFF.projects;

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] ?? role }));

function TierChip({ tier }: { tier: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {tier}
    </span>
  );
}

function ActivationChip({ activated }: { activated: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
        activated
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {activated ? COPY.userActivated : COPY.userPending}
    </span>
  );
}

/**
 * One client record: profile, seats, projects, money queue. Every
 * mutation PATCHes the row it touches and refetches the whole payload,
 * so the numbers here are always the numbers on record.
 */
export function AdminClientDetail({ orgId }: { orgId: string }) {
  const { data, loading, failed, retry, refresh } = usePortalFetch<AdminOrgDetailPayload>(
    `/api/admin/orgs/${orgId}`,
  );
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addSeatOpen, setAddSeatOpen] = useState(false);
  const [resetFor, setResetFor] = useState<AdminUserItem | null>(null);

  // Edit organization form
  const [name, setName] = useState("");
  const [tier, setTier] = useState<string>(TIERS[0]);
  const [country, setCountry] = useState("");
  // Add seat form
  const [seatName, setSeatName] = useState("");
  const [seatEmail, setSeatEmail] = useState("");
  const [seatRole, setSeatRole] = useState<string>(ROLES[1]);
  const [seatPassword, setSeatPassword] = useState("");
  // Reset password form
  const [resetPassword, setResetPassword] = useState("");

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { org, users, projects } = data;

  async function mutate(
    endpoint: string,
    method: "PATCH" | "POST",
    body: unknown,
    successTitle: string,
    onDone?: () => void,
  ) {
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast({ title: successTitle });
        onDone?.();
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
        onDone?.();
      }
    } catch {
      toast({ title: STAFF.states.errorBody });
      onDone?.();
    } finally {
      setBusy(false);
    }
  }

  function openEdit() {
    setName(org.name);
    setTier(org.tier);
    setCountry(org.country);
    setEditOpen(true);
  }

  function submitEdit() {
    void mutate(
      `/api/admin/orgs/${org.id}`,
      "PATCH",
      { name: name.trim(), tier, country: country.trim().toUpperCase() },
      COPY.saved,
      () => setEditOpen(false),
    );
  }

  function openAddSeat() {
    setSeatName("");
    setSeatEmail("");
    setSeatRole(ROLES[1]);
    setSeatPassword("");
    setAddSeatOpen(true);
  }

  function submitSeat() {
    void mutate(
      `/api/admin/orgs/${org.id}/users`,
      "POST",
      {
        name: seatName.trim(),
        email: seatEmail.trim(),
        role: seatRole,
        ...(seatPassword ? { password: seatPassword } : {}),
      },
      COPY.userCreated,
      () => setAddSeatOpen(false),
    );
  }

  function submitReset() {
    if (!resetFor) return;
    void mutate(
      `/api/admin/users/${resetFor.id}`,
      "PATCH",
      { password: resetPassword },
      COPY.userResetDone,
      () => {
        setResetFor(null);
        setResetPassword("");
      },
    );
  }

  return (
    <div>
      <Link
        href={STAFF_NAV_ITEMS.clients.href}
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span>
        {STAFF_NAV_ITEMS.clients.label}
      </Link>

      <PageHeader
        eyebrow={COPY.eyebrow}
        title={org.name}
        sub={`${COPY.colKey} ${org.clientId}${org.country ? ` · ${org.country}` : ""}`}
        actions={
          <Button size="sm" variant="outline" onClick={openEdit}>
            {COPY.editTitle}
          </Button>
        }
      />

      {/* Profile */}
      <AdminPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ListLabel>{COPY.profileTitle}</ListLabel>
          <TierChip tier={org.tier} />
        </div>
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.colKey}
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold">{org.clientId}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.countryLabel}
            </dt>
            <dd className="mt-1 font-mono text-sm font-bold">{org.country}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.since}
            </dt>
            <dd className="mt-1 font-medium">{formatDate(org.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {COPY.outstanding}
            </dt>
            <dd className="mt-1 font-medium">{formatMoney(data.outstandingCents)}</dd>
          </div>
        </dl>
      </AdminPanel>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
        <Stat label={COPY.colSeats} value={String(users.length)} />
        <Stat label={COPY.colQueue} value={String(data.openRequests)} />
      </div>

      {/* Seats */}
      <section className="mt-10" aria-label={COPY.usersTitle}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <ListLabel>{COPY.usersTitle}</ListLabel>
          <Button size="sm" variant="outline" onClick={openAddSeat}>
            {COPY.userAdd}
          </Button>
        </div>
        {users.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {COPY.usersEmpty}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-1.5">
                    <ActivationChip activated={user.activated} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Select
                    value={user.role}
                    disabled={busy}
                    onValueChange={(role) => {
                      if (role === user.role) return;
                      void mutate(`/api/admin/users/${user.id}`, "PATCH", { role }, COPY.userRoleDone);
                    }}
                  >
                    <SelectTrigger
                      aria-label={`${user.email} · ${COPY.userRole}`}
                      className="h-9 w-[140px] border-border bg-background text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setResetFor(user);
                      setResetPassword("");
                    }}
                  >
                    {COPY.userReset}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Projects */}
      <section className="mt-10" aria-label={PROJECTS.colProject}>
        <ListLabel>{PROJECTS.colProject}</ListLabel>
        {projects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {PROJECTS.empty}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-card"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {project.code ? (
                      <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
                    ) : null}
                    <p className="text-sm font-medium">{project.title}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {project.milestoneDone}/{project.milestoneTotal} {PROJECTS.colProgress}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/projects/${project.id}`}
                  aria-label={`${project.title} · ${COPY.open}`}
                  className="inline-flex shrink-0 items-center border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {COPY.open}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit organization */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.editTitle}</DialogTitle>
            <DialogDescription>{COPY.editSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitEdit();
            }}
          >
            <TextField id="org-edit-name" label={COPY.nameLabel} value={name} onChange={setName} />
            <ChoiceField id="org-edit-tier" label={COPY.tierLabel} value={tier} onChange={setTier} options={TIERS} />
            <TextField
              id="org-edit-country"
              label={COPY.countryLabel}
              value={country}
              onChange={setCountry}
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? COPY.saving : COPY.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add seat */}
      <Dialog open={addSeatOpen} onOpenChange={setAddSeatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.userAddTitle}</DialogTitle>
            <DialogDescription>{COPY.userAddSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitSeat();
            }}
          >
            <TextField id="seat-name" label={COPY.userName} value={seatName} onChange={setSeatName} />
            <TextField
              id="seat-email"
              label={COPY.userEmail}
              type="email"
              value={seatEmail}
              onChange={setSeatEmail}
            />
            <ChoiceField id="seat-role" label={COPY.userRole} value={seatRole} onChange={setSeatRole} options={ROLE_OPTIONS} />
            <TextField
              id="seat-password"
              label={COPY.userPassword}
              type="password"
              value={seatPassword}
              onChange={setSeatPassword}
              hint={COPY.ownerHint}
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddSeatOpen(false)}>
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : COPY.userCreate}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset password */}
      <Dialog
        open={resetFor !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResetFor(null);
            setResetPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COPY.userResetTitle}</DialogTitle>
            <DialogDescription>{resetFor?.email ? `${resetFor.email} · ${COPY.userResetSub}` : COPY.userResetSub}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitReset();
            }}
          >
            <TextField
              id="seat-reset-password"
              label={COPY.userNewPassword}
              type="password"
              value={resetPassword}
              onChange={setResetPassword}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setResetFor(null);
                  setResetPassword("");
                }}
              >
                {STAFF.states.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? STAFF.states.working : COPY.userReset}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
