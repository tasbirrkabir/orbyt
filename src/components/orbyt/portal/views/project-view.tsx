"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DASHBOARD, PORTAL } from "@/content/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import { ProjectPanel } from "@/components/orbyt/dashboard/project-panel";
import type { MePayload } from "@/components/orbyt/dashboard/types";
import { usePortalData } from "../use-portal";
import { PortalLoading, PortalLoadError } from "../portal-states";
import { PortalPageHeader } from "../portal-page-header";

const COPY = PORTAL.projectPage;
const PROFILE = DASHBOARD.profile;

/**
 * The brief, in the client's own words from onboarding: company, stage,
 * the 90-day goal and the friction they flagged. Kept above the log so
 * every update reads against the standard they set.
 */
function BriefCard({ data }: { data: MePayload }) {
  const reduced = useReducedMotion();
  const profile = data.profile;

  if (!profile) {
    return (
      <Reveal className="mt-10">
        <section
          aria-label={COPY.brief.label}
          className="border border-border bg-card p-5 sm:p-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.brief.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {COPY.brief.empty}
          </p>
          <Button asChild className="mt-4 h-11 font-semibold">
            <Link href="/onboarding">{COPY.brief.emptyCta}</Link>
          </Button>
        </section>
      </Reveal>
    );
  }

  return (
    <Reveal className="mt-10">
      <section
        aria-label={COPY.brief.label}
        className="border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {COPY.brief.label}
            </p>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
              {COPY.brief.title}
            </h2>
          </div>
          {profile.company ? (
            <Badge variant="outline" className="h-7 px-3 font-mono text-[10px] tracking-[0.16em]">
              {profile.company}
            </Badge>
          ) : null}
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {PROFILE.fields.goal}
            </p>
            <p className="mt-2 font-display text-base font-bold leading-snug tracking-tight">
              {profile.goal}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {PROFILE.fields.challenges}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(profile.challenges ?? []).map((challenge) => (
                <Badge key={challenge} variant="secondary">
                  {challenge}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {[profile.industry, profile.stage, profile.tools]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
          <Button asChild variant="outline" size="sm" className="h-9 font-semibold">
            <Link href="/workspace/profile">{COPY.brief.profileCta}</Link>
          </Button>
        </div>
      </section>
    </Reveal>
  );
}

export function ProjectView() {
  const { data, failed, refresh, approveUpdate } = usePortalData();

  if (!data) {
    return failed ? <PortalLoadError /> : <PortalLoading />;
  }

  return (
    <div>
      <PortalPageHeader
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        sub={COPY.sub}
      />

      <BriefCard data={data} />

      <div className="mt-6">
        <ProjectPanel projects={data.projects} onApprove={approveUpdate} />
      </div>
    </div>
  );
}
