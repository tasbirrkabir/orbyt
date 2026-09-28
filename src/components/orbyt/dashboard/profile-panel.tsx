"use client";

import Link from "next/link";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { DASHBOARD } from "@/content/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import type { MeProfile } from "./types";
import { CountUp } from "./count-up";

const COPY = DASHBOARD.profile;
const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

/** How much of the system we can see, from what onboarding captured. */
export function profileCompletion(profile: MeProfile | null) {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.company),
    Boolean(profile.industry),
    Boolean(profile.stage),
    (profile.challenges ?? []).length > 0,
    Boolean(profile.tools),
    Boolean(profile.goal),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function FieldRow({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <Reveal delay={0.05 * index} y={12}>
      <div>
        <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm leading-relaxed">{value}</dd>
      </div>
    </Reveal>
  );
}

type ProfilePanelProps = {
  profile: MeProfile | null;
  updatedAt: string | null;
};

/**
 * The system profile card: an animated completion ring, every persisted
 * field, and the honest empty state when onboarding hasn't happened yet.
 */
export function ProfilePanel({ profile, updatedAt }: ProfilePanelProps) {
  const reduced = useReducedMotion();
  const completion = profileCompletion(profile);
  const fieldsOnFile = profile
    ? [
        Boolean(profile.company),
        Boolean(profile.industry),
        Boolean(profile.stage),
        (profile.challenges ?? []).length > 0,
        Boolean(profile.tools),
        Boolean(profile.goal),
      ].filter(Boolean).length
    : 0;

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <Reveal>
        <h2 className="font-display text-xl font-bold tracking-tight">{COPY.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{COPY.sub}</p>
      </Reveal>

      {/* Completion ring + meta */}
      <Reveal delay={0.08}>
        <div className="mt-5 flex items-center gap-5">
          <span className="relative inline-flex size-[104px] shrink-0 items-center justify-center">
            <svg viewBox="0 0 104 104" className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx={52}
                cy={52}
                r={46}
                fill="none"
                stroke="rgba(250, 247, 242, 0.12)"
                strokeWidth={5}
              />
              <motion.circle
                cx={52}
                cy={52}
                r={46}
                fill="none"
                stroke="#fd5a01"
                strokeWidth={5}
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: completion / 100 }}
                viewport={VIEWPORT}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </svg>
            <span className="font-display text-xl font-bold leading-none tracking-tight">
              <CountUp value={completion} suffix="%" />
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {fieldsOnFile} {COPY.fieldsCount}
            </p>
            {profile && updatedAt ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {COPY.updated} {format(new Date(updatedAt), "MMM d, yyyy")}
              </p>
            ) : null}
          </div>
        </div>
      </Reveal>

      {profile ? (
        <>
          <dl className="mt-6 space-y-4 border-t border-border pt-5">
            <FieldRow index={0} label={COPY.fields.company} value={profile.company} />
            <FieldRow index={1} label={COPY.fields.industry} value={profile.industry} />
            <FieldRow index={2} label={COPY.fields.stage} value={profile.stage} />
            <Reveal delay={0.15} y={12}>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {COPY.fields.challenges}
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {(profile.challenges ?? []).map((challenge) => (
                    <Badge key={challenge} variant="secondary">
                      {challenge}
                    </Badge>
                  ))}
                </dd>
              </div>
            </Reveal>
            <FieldRow
              index={4}
              label={COPY.fields.tools}
              value={profile.tools ?? COPY.notSet}
            />
            <FieldRow index={5} label={COPY.fields.goal} value={profile.goal} />
          </dl>
          <Button asChild variant="outline" className="mt-6 h-11 font-semibold">
            <Link href="/onboarding">{COPY.edit}</Link>
          </Button>
        </>
      ) : (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{COPY.empty}</p>
          <Button asChild className="mt-4 h-11 font-semibold">
            <Link href="/onboarding">{COPY.emptyCta}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
