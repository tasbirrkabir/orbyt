"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";
import {
  formatAge,
  formatDate,
  formatDateTime,
  formatMoney,
  greetingBucket,
  PROJECT_TYPE_LABELS,
} from "@/lib/portal/domain";
import type { OverviewPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { LoadingState, ErrorState, ProgressBar, Section } from "./primitives";
import { StatusBadge, StatusDot, statusGlyph } from "./status-badge";
import { StageRail } from "./stage-rail";

const DEMO_CLIENT_IDS = ["ORB-DEMO", "ORB-NOVA", "ORB-ATLAS"];

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>
  );
}

export function CommandOverview() {
  const { data, loading, failed, retry } = usePortalFetch<OverviewPayload>("/api/portal/overview");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const greeting = COMMAND.overview.eyebrow === "COMMAND CENTER" ? greetingBucket() : "evening";
  const greetingLine =
    greeting === "morning" ? "Good morning" : greeting === "afternoon" ? "Good afternoon" : "Good evening";
  const isDemo = DEMO_CLIENT_IDS.includes(data.identity.clientId);
  const { activeProject: project } = data;

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

          {/* 2. Needs your attention */}
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
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">{item.title}</p>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                          {formatAge(item.date)}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary underline-offset-4 group-hover:underline">
                          {item.ctaLabel}
                        </span>
                      </div>
                    </Link>
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
                        <StatusDot status={system.status} />
                        <span className="truncate">{system.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {statusGlyph(system.status)} {system.status.toLowerCase()}
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
    </div>
  );
}
