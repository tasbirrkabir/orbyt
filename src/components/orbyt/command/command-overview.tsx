"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, MessageSquarePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import {
  formatAge,
  formatDate,
  formatDateTime,
  formatMoney,
  greetingBucket,
  PROJECT_TYPE_LABELS,
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
} from "@/lib/portal/domain";
import type { AttentionItem, OverviewPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { LoadingState, ErrorState, ProgressBar, Section } from "./primitives";
import { StatusBadge } from "./status-badge";
import { StageRail } from "./stage-rail";

const DEMO_CLIENT_IDS = ["ORB-DEMO", "ORB-NOVA", "ORB-ATLAS"];

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>
  );
}

/** Kinds the client can settle right here, without navigating away. */
type DecidableAttention = AttentionItem & { kind: "APPROVAL" | "CHANGE_REQUEST" };

function isDecidable(item: AttentionItem): item is DecidableAttention {
  return item.kind === "APPROVAL" || item.kind === "CHANGE_REQUEST";
}

export function CommandOverview() {
  const { data, loading, failed, retry, refresh } = usePortalFetch<OverviewPayload>("/api/portal/overview");
  const reduced = useReducedMotion();

  // Inline decision state: one dialog at a time, keyed by attention id.
  const [decideItem, setDecideItem] = useState<DecidableAttention | null>(null);
  const [decideNote, setDecideNote] = useState("");
  const [decideBusy, setDecideBusy] = useState(false);
  const [decideError, setDecideError] = useState<string | null>(null);

  // Quick action state.
  const [quickOpen, setQuickOpen] = useState<"request" | "message" | null>(null);
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const greeting = COMMAND.overview.eyebrow === "COMMAND CENTER" ? greetingBucket() : "evening";
  const greetingLine =
    greeting === "morning" ? "Good morning" : greeting === "afternoon" ? "Good afternoon" : "Good evening";
  const isDemo = DEMO_CLIENT_IDS.includes(data.identity.clientId);
  const { activeProject: project } = data;

  async function submitDecision(decision: "APPROVE" | "REQUEST_CHANGES" | "ACCEPTED" | "DECLINED") {
    if (!decideItem || decideBusy) return;
    const note = decideNote.trim();
    if (decideItem.kind === "APPROVAL" && decision === "REQUEST_CHANGES" && note.length < 4) {
      setDecideError("Say what should change — a comment is required.");
      return;
    }
    if (decideItem.kind === "CHANGE_REQUEST" && decision === "DECLINED" && note.length < 4) {
      setDecideError("Say why you are declining — a note is required.");
      return;
    }
    setDecideBusy(true);
    setDecideError(null);
    try {
      const url =
        decideItem.kind === "APPROVAL"
          ? `/api/portal/approvals/${decideItem.id.replace("approval-", "")}`
          : `/api/portal/change-requests/${decideItem.id.replace("cr-", "")}`;
      const body =
        decideItem.kind === "APPROVAL"
          ? { decision, comment: note }
          : { decision, note: note || undefined };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setDecideError(payload.error ?? "That did not go through. Try again.");
        return;
      }
      setDecideItem(null);
      setDecideNote("");
      refresh();
    } catch {
      setDecideError("Network trouble. Try again.");
    } finally {
      setDecideBusy(false);
    }
  }

  async function submitQuick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickOpen || quickBusy) return;
    const form = new FormData(event.currentTarget);
    setQuickBusy(true);
    setQuickError(null);
    try {
      const payload =
        quickOpen === "request"
          ? {
              title: String(form.get("title") ?? ""),
              category: String(form.get("category") ?? "OTHER"),
              priority: String(form.get("priority") ?? "NORMAL"),
              description: String(form.get("description") ?? ""),
            }
          : {
              subject: String(form.get("subject") ?? ""),
              body: String(form.get("body") ?? ""),
            };
      const response = await fetch(quickOpen === "request" ? "/api/portal/requests" : "/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setQuickError(result.error ?? "That did not go through. Try again.");
        return;
      }
      setQuickOpen(null);
      refresh();
    } catch {
      setQuickError("Network trouble. Try again.");
    } finally {
      setQuickBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {COMMAND.overview.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {greetingLine}, {data.greetingName}.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {COMMAND.overview.sub}
        </p>
        {isDemo ? (
          <p className="mt-4 inline-flex max-w-2xl items-start gap-2 border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {COMMAND.overview.demoNote.tag}
            </span>
            <span>{COMMAND.overview.demoNote.body}</span>
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button size="sm" onClick={() => { setQuickOpen("request"); setQuickError(null); }}>
            <Plus className="h-3.5 w-3.5" /> Raise a request
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setQuickOpen("message"); setQuickError(null); }}>
            <MessageSquarePlus className="h-3.5 w-3.5" /> Message the crew
          </Button>
        </div>
      </motion.header>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
        {/* Primary column */}
        <div className="min-w-0 space-y-10 lg:col-span-2">
          {/* 1. Active project */}
          <section aria-label={COMMAND.overview.project.label}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.overview.project.label}
            </h2>
            {project ? (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
              >
                <Panel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-display text-lg font-bold leading-tight">{project.title}</h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {project.code ? `${project.code} · ` : ""}
                        {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold tabular-nums text-primary">
                        {project.progress}%
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.overview.project.progressAria}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={project.progress} label={`${project.title} progress`} />
                  </div>

                  <div className="mt-5">
                    <StageRail current={project.stage} />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.overview.project.nextMilestone}
                      </dt>
                      <dd className="mt-0.5 font-medium">{project.nextMilestone ?? "..."}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.overview.project.targetLaunch}
                      </dt>
                      <dd className="mt-0.5 font-medium">
                        {project.targetLaunchAt ? formatDate(project.targetLaunchAt) : "..."}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.overview.project.owner}
                      </dt>
                      <dd className="mt-0.5 font-medium">{project.ownerLabel}</dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/workspace/projects/${project.id}`}>
                        {COMMAND.overview.project.open}
                      </Link>
                    </Button>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <Panel className="border-dashed bg-transparent">
                <p className="font-display text-base font-semibold">{COMMAND.overview.project.noProjectTitle}</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {COMMAND.overview.project.noProjectBody}
                </p>
              </Panel>
            )}
          </section>

          {/* 2. Needs your attention — with inline decisions */}
          <section aria-label={COMMAND.overview.attention.label}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.overview.attention.label}
            </h2>
            {data.attention.length === 0 ? (
              <Panel className="border-dashed bg-transparent">
                <p className="flex items-center gap-2 font-medium">
                  <span aria-hidden="true" className="text-primary">✓</span>
                  {COMMAND.overview.attention.allClear}
                </p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {COMMAND.overview.attention.allClearBody}
                </p>
              </Panel>
            ) : (
              <ul role="list" className="divide-y divide-border border border-border bg-card/50">
                {data.attention.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.03 * index, ease: "easeOut" }}
                  >
                    <div className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-accent/50">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{item.title}</p>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                          {formatAge(item.date)}
                        </span>
                        {isDecidable(item) ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDecideItem(item);
                                setDecideNote("");
                                setDecideError(null);
                              }}
                            >
                              {item.ctaLabel}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDecideItem(item);
                                setDecideNote("");
                                setDecideError(null);
                              }}
                            >
                              {item.kind === "APPROVAL" ? "Approve" : "Accept"}
                            </Button>
                          </>
                        ) : (
                          <Link
                            href={item.href}
                            className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary underline-offset-4 group-hover:underline"
                          >
                            {item.ctaLabel}
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>

          {/* 5. Recent activity */}
          <Section
            label={COMMAND.overview.activity.label}
            action={
              <Link
                href="/workspace/activity"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {COMMAND.overview.activity.open}
              </Link>
            }
            className="!mt-10"
          >
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{COMMAND.activity.empty}</p>
            ) : (
              <ul role="list" className="border-t border-border">
                {data.recentActivity.slice(0, 6).map((event) => (
                  <li key={event.id} className="flex items-baseline gap-3 border-b border-border py-2.5">
                    <span
                      aria-hidden="true"
                      className="w-4 shrink-0 text-center font-mono text-xs text-primary/70"
                    >
                      {event.actorRole === "CLIENT" ? "›" : "·"}
                    </span>
                    <p className="min-w-0 flex-1 text-sm leading-snug">
                      {event.link ? (
                        <Link href={event.link} className="underline-offset-4 hover:underline">
                          {event.title}
                        </Link>
                      ) : (
                        event.title
                      )}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatAge(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Side column */}
        <div className="min-w-0 space-y-10">
          {/* 3. ORBYT Pulse */}
          {data.pulse ? (
            <section aria-label={COMMAND.overview.pulse.label}>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {COMMAND.overview.pulse.label}
              </h2>
              <Panel>
                <p className="font-display text-sm font-bold">
                  {COMMAND.overview.pulse.healthyLine(data.pulse.healthyCount, data.pulse.totalCount)}
                </p>
                <ul role="list" className="mt-3 space-y-2.5">
                  {data.pulse.systems.map((system) => (
                    <li key={system.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-primary/70" />
                        <span className="truncate">{system.name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {system.status.toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link href="/workspace/systems">{COMMAND.overview.pulse.open}</Link>
                </Button>
              </Panel>
            </section>
          ) : null}

          {/* 4. Next up */}
          <section aria-label={COMMAND.overview.nextUp.label}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {COMMAND.overview.nextUp.label}
            </h2>
            {data.nextUp ? (
              <Panel>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                  {data.nextUp.kind}
                </p>
                <p className="mt-1.5 font-display text-base font-bold leading-snug">{data.nextUp.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(data.nextUp.date)}</p>
                {data.nextUp.href ? (
                  <Link
                    href={data.nextUp.href}
                    className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </Link>
                ) : null}
              </Panel>
            ) : (
              <Panel className="border-dashed bg-transparent">
                <p className="text-sm text-muted-foreground">{COMMAND.overview.nextUp.nothing}</p>
              </Panel>
            )}
          </section>

          {/* Upcoming meetings */}
          {data.upcomingMeetings.length > 0 ? (
            <section aria-label={COMMAND.overview.meetings.label}>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {COMMAND.overview.meetings.label}
              </h2>
              <ul role="list" className="space-y-3">
                {data.upcomingMeetings.map((meeting) => (
                  <li key={meeting.id} className="border-l-2 border-primary/50 pl-3">
                    <p className="text-sm font-medium leading-snug">{meeting.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {formatDateTime(meeting.startsAt)} · {COMMAND.overview.meetings.minutes(meeting.durationMins)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Billing snapshot */}
          {data.billing ? (
            <section aria-label={COMMAND.overview.billing.label}>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {COMMAND.overview.billing.label}
              </h2>
              <Panel>
                <p className="font-display text-xl font-bold tabular-nums">
                  {formatMoney(data.billing.pendingTotalCents)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {COMMAND.overview.billing.dueLine} {data.billing.pendingCount}{" "}
                  {COMMAND.overview.billing.invoices(data.billing.pendingCount)}
                  {data.billing.nextDueDate ? `, next due ${formatDate(data.billing.nextDueDate)}` : ""}.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link href="/workspace/billing">{COMMAND.overview.billing.open}</Link>
                </Button>
              </Panel>
            </section>
          ) : null}
        </div>
      </div>

      {/* Inline decision dialog */}
      <Dialog open={decideItem !== null} onOpenChange={(open) => { if (!open) setDecideItem(null); }}>
        <DialogContent className="sm:max-w-lg">
          {decideItem ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {decideItem.kind === "APPROVAL" ? "Sign-off decision" : "Change request decision"}
                </DialogTitle>
                <DialogDescription>{decideItem.title}</DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-muted-foreground">{decideItem.detail}</p>
              <div className="space-y-2">
                <Label htmlFor="decide-note">
                  {decideItem.kind === "APPROVAL" ? "Comment (optional)" : "Note (optional for accept)"}
                </Label>
                <Textarea
                  id="decide-note"
                  value={decideNote}
                  onChange={(event) => setDecideNote(event.target.value)}
                  rows={3}
                  placeholder={
                    decideItem.kind === "APPROVAL"
                      ? "Anything the crew should know alongside your decision."
                      : "Anything the crew should know alongside your decision."
                  }
                />
              </div>
              {decideError ? <p className="text-sm text-red-600">{decideError}</p> : null}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  disabled={decideBusy}
                  onClick={() => void submitDecision(decideItem.kind === "APPROVAL" ? "REQUEST_CHANGES" : "DECLINED")}
                >
                  {decideItem.kind === "APPROVAL" ? "Request changes" : "Decline"}
                </Button>
                <Button disabled={decideBusy} onClick={() => void submitDecision(decideItem.kind === "APPROVAL" ? "APPROVE" : "ACCEPTED")}>
                  {decideBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {decideItem.kind === "APPROVAL" ? "Approve" : "Accept"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Quick actions dialog */}
      <Dialog open={quickOpen !== null} onOpenChange={(open) => { if (!open) setQuickOpen(null); }}>
        <DialogContent className="sm:max-w-lg">
          {quickOpen ? (
            <form onSubmit={(event) => void submitQuick(event)}>
              <DialogHeader>
                <DialogTitle>{quickOpen === "request" ? "Raise a request" : "Message the crew"}</DialogTitle>
                <DialogDescription>
                  {quickOpen === "request"
                    ? "File it. The desk picks it up, and the lifecycle is tracked end to end."
                    : "Start a conversation. The crew replies in the thread."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                {quickOpen === "request" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="quick-title">What do you need?</Label>
                      <Input id="quick-title" name="title" required minLength={4} maxLength={120} placeholder="Short, specific summary" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="quick-category">Category</Label>
                        <Select name="category" defaultValue="OTHER">
                          <SelectTrigger id="quick-category"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {REQUEST_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0) + category.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="quick-priority">Priority</Label>
                        <Select name="priority" defaultValue="NORMAL">
                          <SelectTrigger id="quick-priority"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {REQUEST_PRIORITIES.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority.charAt(0) + priority.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quick-description">Detail</Label>
                      <Textarea id="quick-description" name="description" required minLength={10} maxLength={4000} rows={4} placeholder="What is the context, what does done look like?" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="quick-subject">Subject</Label>
                      <Input id="quick-subject" name="subject" required minLength={3} maxLength={120} placeholder="What is this about?" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quick-body">Message</Label>
                      <Textarea id="quick-body" name="body" required minLength={2} maxLength={4000} rows={4} placeholder="Write it out — this opens a tracked thread." />
                    </div>
                  </>
                )}
              </div>
              {quickError ? <p className="mt-3 text-sm text-red-600">{quickError}</p> : null}
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={quickBusy}>
                  {quickBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {quickOpen === "request" ? "File the request" : "Send the message"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
