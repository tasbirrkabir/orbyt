"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { DASHBOARD, PORTAL, PROTECTED } from "@/content/flows";
import { CONTACT } from "@/content/orbyt";
import { DEMO_EMAIL } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/orbyt/magnetic";
import { Scramble } from "@/components/orbyt/scramble";
import { SiteShell } from "@/components/orbyt/site-shell";
import { PortalGate } from "@/components/orbyt/portal/portal-gate";
import { ConsoleFrame } from "@/components/orbyt/dashboard/console-frame";
import { StatTiles, type StatItem } from "@/components/orbyt/dashboard/stat-tiles";
import { SystemMap } from "@/components/orbyt/dashboard/system-map";
import { ProjectPanel } from "@/components/orbyt/dashboard/project-panel";
import { ConversationLog } from "@/components/orbyt/dashboard/conversation-log";
import { ProfilePanel, profileCompletion } from "@/components/orbyt/dashboard/profile-panel";
import { NextSteps } from "@/components/orbyt/dashboard/next-steps";
import type { MePayload } from "@/components/orbyt/dashboard/types";

/** Mono status token, same language as the contact success panel. */
const ERROR_LABEL = "ERROR";

function greetingFor(hour: number) {
  if (hour < 12) return DASHBOARD.greeting.morning;
  if (hour < 18) return DASHBOARD.greeting.afternoon;
  return DASHBOARD.greeting.evening;
}

/** Join day counts as day one. */
function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {PROTECTED.redirecting}
      </p>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div aria-hidden="true" className="mt-10 grid gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((card) => (
        <div key={card} className="rounded-xl border bg-card p-6">
          <div className="h-4 w-1/3 animate-pulse bg-muted" />
          <div className="mt-3 h-3 w-2/3 animate-pulse bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-3 w-full animate-pulse bg-muted" />
            <div className="h-3 w-5/6 animate-pulse bg-muted" />
            <div className="h-3 w-4/6 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkspaceBody({ data }: { data: MePayload }) {
  const reduced = useReducedMotion();

  const greeting = greetingFor(new Date().getHours());
  const email = data.user.email;
  const displayName = data.user.name || email.split("@")[0];
  const submissions = data.submissions ?? [];
  const projects = data.projects ?? [];
  const days = daysSince(data.user.createdAt);
  const portalKey = data.user.clientId ?? email.toUpperCase();

  const completion = profileCompletion(data.profile);
  const frictionCount = (data.profile?.challenges ?? []).length;
  const isDemo = email === DEMO_EMAIL;

  const stats: StatItem[] = [
    { value: submissions.length, label: DASHBOARD.stats.messages.label, hint: DASHBOARD.stats.messages.hint },
    { value: completion, suffix: "%", label: DASHBOARD.stats.completion.label, hint: DASHBOARD.stats.completion.hint },
    { value: projects.length, label: DASHBOARD.stats.projects.label, hint: DASHBOARD.stats.projects.hint },
    { value: frictionCount, label: DASHBOARD.stats.friction.label, hint: DASHBOARD.stats.friction.hint },
  ];

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <ConsoleFrame>
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
            onClick={() => signOut({ callbackUrl: "/" })}
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
            <Button
              asChild
              variant="outline"
              className="h-10 shrink-0 font-semibold"
            >
              <Link href="/contact">{DASHBOARD.demo.cta}</Link>
            </Button>
          </div>
        ) : null}

        {/* Gauges */}
        <StatTiles items={stats} />

        {/* Workspace grid */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-3">
            <ProjectPanel projects={projects} />
            <SystemMap profile={data.profile} />
            <ConversationLog submissions={submissions} />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <ProfilePanel profile={data.profile} updatedAt={data.profile?.updatedAt ?? null} />
            <NextSteps data={data} />
          </div>
        </div>

        {/* Quick moves */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 lg:flex-row lg:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:mr-auto">
            {DASHBOARD.actions.label}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Magnetic strength={0.25}>
              <Button asChild className="h-11 w-full font-semibold sm:w-auto">
                <Link href={DASHBOARD.actions.start.href} className="gap-2">
                  {DASHBOARD.actions.start.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button asChild variant="outline" className="h-11 w-full font-semibold sm:w-auto">
                <Link href={DASHBOARD.actions.profile.href} className="gap-2">
                  {DASHBOARD.actions.profile.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button asChild variant="outline" className="h-11 w-full font-semibold sm:w-auto">
                <Link href={DASHBOARD.actions.insights.href} className="gap-2">
                  {DASHBOARD.actions.insights.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </ConsoleFrame>
    </motion.div>
  );
}

export default function WorkspacePage() {
  const { status, update } = useSession();
  const [data, setData] = useState<MePayload | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;

    async function load(isRetry = false) {
      try {
        const response = await fetch("/api/me");
        if (response.status === 401) {
          if (active) setNeedLogin(true);
          return;
        }
        if (!response.ok) throw new Error("request failed");
        const payload = (await response.json()) as MePayload;
        if (active) {
          setData(payload);
          setFailed(false);
        }
      } catch {
        if (!isRetry) {
          window.setTimeout(() => {
            if (active) void load(true);
          }, 1200);
        } else if (active) {
          setFailed(true);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          {status === "loading" ? <SessionSpinner /> : null}

          {status === "unauthenticated" || needLogin ? (
            <PortalGate
              next="/workspace"
              onSignedIn={() => {
                // Refresh the session in place; the portal replaces the
                // gate on this same page, no redirect.
                void update();
              }}
            />
          ) : null}

          {status === "authenticated" && !needLogin ? (
            data ? (
              <WorkspaceBody data={data} />
            ) : failed ? (
              <div className="mt-10 rounded-md border border-destructive/40 bg-destructive/10 p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-destructive">
                  {ERROR_LABEL}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-destructive">
                  {CONTACT.form.error}
                </p>
              </div>
            ) : (
              <>
                <SessionSpinner />
                <SkeletonCards />
              </>
            )
          ) : null}
        </div>
      </main>
    </SiteShell>
  );
}
