"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DASHBOARD, PORTAL } from "@/content/flows";
import { DEMO_EMAIL } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scramble } from "@/components/orbyt/scramble";
import { Reveal } from "@/components/orbyt/reveal";
import { StatTiles, type StatItem } from "@/components/orbyt/dashboard/stat-tiles";
import { NextSteps } from "@/components/orbyt/dashboard/next-steps";
import { profileCompletion } from "@/components/orbyt/dashboard/profile-panel";
import type { MePayload } from "@/components/orbyt/dashboard/types";
import { usePortalData } from "../use-portal";
import { PortalLoading, PortalLoadError } from "../portal-states";
import { QuickLinks } from "../quick-links";

const COPY = PORTAL.overview.attention;

/** Join day counts as day one. */
function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

function greetingFor(hour: number) {
  if (hour < 12) return DASHBOARD.greeting.morning;
  if (hour < 18) return DASHBOARD.greeting.afternoon;
  return DASHBOARD.greeting.evening;
}

/**
 * The front desk of the portal. It answers the first question every
 * client has on arrival: what needs me, and where is everything else.
 */
function AttentionCard({ data }: { data: MePayload }) {
  const projects = data.projects ?? [];
  const pending = projects.reduce(
    (sum, project) =>
      sum +
      project.updates.filter(
        (update) => update.tag === "SHIPPED" && !update.acknowledgedAt,
      ).length,
    0,
  );
  const latest = projects[0]?.updates[0] ?? null;

  if (pending > 0) {
    return (
      <Reveal className="mt-8">
        <div className="flex flex-col gap-4 rounded-md border border-primary/40 bg-primary/10 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="min-w-0 lg:mr-auto">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
              {COPY.label}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              {pending === 1 ? COPY.approvalsOne : COPY.approvalsMany(pending)}
            </p>
          </div>
          <Button asChild className="h-11 shrink-0 font-semibold">
            <Link href="/workspace/project" className="gap-2">
              {COPY.approvalsCta}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    );
  }

  if (latest) {
    return (
      <Reveal className="mt-8">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-background/60 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="min-w-0 lg:mr-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {COPY.latestLabel}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge
                variant={latest.tag === "SHIPPED" ? "default" : "secondary"}
                className="font-mono text-[10px] tracking-[0.14em]"
              >
                {latest.tag}
              </Badge>
              <time
                dateTime={latest.createdAt}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                {format(new Date(latest.createdAt), "MMM d, yyyy")}
              </time>
            </div>
            <p className="mt-2 font-display text-lg font-bold leading-snug tracking-tight">
              {latest.title}
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 shrink-0 font-semibold">
            <Link href="/workspace/project" className="gap-2">
              {COPY.latestCta}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className="mt-8">
      <p className="rounded-md border border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground sm:p-5">
        {COPY.allClear}
      </p>
    </Reveal>
  );
}

export function OverviewView() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const { data, failed } = usePortalData();

  if (!data) {
    return failed ? <PortalLoadError /> : <PortalLoading />;
  }

  const greeting = greetingFor(new Date().getHours());
  const email = data.user.email;
  const displayName = data.user.name || email.split("@")[0];
  const submissions = data.submissions ?? [];
  const deliverables = data.deliverables ?? [];
  const days = daysSince(data.user.createdAt);
  const portalKey = data.user.clientId ?? email.toUpperCase();
  const completion = profileCompletion(data.profile);
  const isDemo = email === DEMO_EMAIL;

  const pendingApprovals = (data.projects ?? []).reduce(
    (sum, project) =>
      sum +
      project.updates.filter(
        (update) => update.tag === "SHIPPED" && !update.acknowledgedAt,
      ).length,
    0,
  );

  const stats: StatItem[] = [
    { value: pendingApprovals, label: DASHBOARD.stats.approvals.label, hint: DASHBOARD.stats.approvals.hint },
    { value: deliverables.filter((d) => d.status === "DELIVERED").length, label: PORTAL.deliverables.sections.delivered, hint: "Files and docs already in your hands." },
    { value: submissions.length, label: DASHBOARD.stats.messages.label, hint: DASHBOARD.stats.messages.hint },
    { value: completion, suffix: "%", label: DASHBOARD.stats.completion.label, hint: DASHBOARD.stats.completion.hint },
  ];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* Command header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="max-w-full truncate">
            <Scramble
              text={`${DASHBOARD.console.workspace} // ${portalKey}`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary"
            />
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            <span className="block overflow-hidden pb-1">
              {reduced ? (
                <span className="block">
                  {greeting}, {displayName}.
                </span>
              ) : (
                <motion.span
                  className="block"
                  initial={{ y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {greeting}, {displayName}.
                </motion.span>
              )}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {DASHBOARD.sub}
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-primary">{PORTAL.clientIdLine} {portalKey}</span>
            {" · "}
            <span>{DASHBOARD.tenure.prefix} {days}</span>
            {" · "}
            {DASHBOARD.tenure.since}{" "}
            {format(new Date(data.user.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Log out without the server redirect: behind the preview
            // gateway, NextAuth would bounce to NEXTAUTH_URL. Clear the
            // session in place, then push home from the current origin.
            void signOut({ redirect: false }).then(() => router.push("/"));
          }}
          className="h-11 shrink-0 font-semibold"
        >
          {DASHBOARD.signOut}
        </Button>
      </header>

      {/* Demo disclosure: sample data, honestly labeled. */}
      {isDemo ? (
        <div className="mt-8 flex flex-col gap-4 rounded-md border border-primary/30 bg-primary/5 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="min-w-0 lg:mr-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {DASHBOARD.demo.tag}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {DASHBOARD.demo.body}
            </p>
          </div>
          <Button asChild variant="outline" className="h-10 shrink-0 font-semibold">
            <Link href="/contact">{DASHBOARD.demo.cta}</Link>
          </Button>
        </div>
      ) : null}

      {/* What needs the client, right now. */}
      <AttentionCard data={data} />

      {/* Gauges */}
      <StatTiles items={stats} />

      {/* The rest of the portal */}
      <QuickLinks />

      {/* The path from here */}
      <div className="mt-10">
        <NextSteps data={data} />
      </div>
    </motion.div>
  );
}
