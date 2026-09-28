"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { DASHBOARD } from "@/content/flows";
import { SERVICES } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/orbyt/reveal";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { MeProfile } from "./types";

const MAP = DASHBOARD.map;
const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

/**
 * Honest routing table: each onboarding friction phrase maps to the pillar
 * whose "signs" literally describe it. Substring match on lowercase, so
 * slight rewording of the source copy keeps the map working.
 */
const ROUTING: Array<{ match: string; pillar: string }> = [
  { match: "leads go cold", pillar: "digital-systems" },
  { match: "manual busywork", pillar: "ai-automation" },
  { match: "data can't be trusted", pillar: "data-tracking" },
  { match: "website doesn't convert", pillar: "web-digital" },
  { match: "tools that don't talk", pillar: "digital-systems" },
  { match: "no clear numbers", pillar: "data-tracking" },
];

function routeChallenges(challenges: string[]): Array<{ challenge: string; slug: string }> {
  const routed: Array<{ challenge: string; slug: string }> = [];
  for (const challenge of challenges) {
    const needle = challenge.toLowerCase();
    const hit = ROUTING.find((route) => needle.includes(route.match));
    if (hit) routed.push({ challenge, slug: hit.pillar });
  }
  return routed;
}

/** Pentagon positions, starting at 12 o'clock. */
const ANGLES = [-90, -18, 54, 126, 198];
const RADIUS = 36;

function polar(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(rad), y: 50 + RADIUS * Math.sin(rad) };
}

function initialsFor(company: string) {
  const words = company.trim().split(/\s+/).slice(0, 2);
  const letters = words.map((word) => word[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

/** Container width in px, so the CSS orbit satellites can ride the ring. */
function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

type SystemMapProps = { profile: MeProfile | null };

export function SystemMap({ profile }: SystemMapProps) {
  const reduced = useReducedMotion();
  const { ref, width } = useMeasuredWidth();

  const challenges = profile?.challenges ?? [];
  const routed = routeChallenges(challenges);
  const activeSlugs = new Set(routed.map((route) => route.slug));
  const active = profile !== null;
  const coreLabel = profile?.company ?? MAP.coreEmpty;
  const coreInitials = profile ? initialsFor(profile.company) : "?";

  const orbitRadius = Math.round(width * (RADIUS / 100));

  return (
    <section aria-label={MAP.title} className="border border-border bg-card p-5 sm:p-6">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {MAP.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
          {MAP.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {MAP.sub}
        </p>
      </Reveal>

      {/* Orbital plate */}
      <div
        ref={ref}
        className="relative mx-auto mt-6 aspect-square w-full max-w-[400px]"
      >
        {/* Crawling dashed orbit */}
        <div
          aria-hidden="true"
          className="absolute inset-[14%] animate-spin-slow rounded-full border border-dashed border-border"
          style={{ "--spin-duration": "48s" } as CSSProperties}
        />

        {/* Satellites: travel the ring, tuck behind the plate via z-index */}
        {!reduced && width > 0 ? (
          <>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-0 size-1.5 animate-orbit bg-primary"
              style={
                {
                  marginLeft: -3,
                  marginTop: -3,
                  "--orbit-radius": `${orbitRadius}px`,
                  "--orbit-duration": "20s",
                } as CSSProperties
              }
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-0 size-1 animate-orbit-reverse bg-ember-tint"
              style={
                {
                  marginLeft: -2,
                  marginTop: -2,
                  "--orbit-radius": `${orbitRadius}px`,
                  "--orbit-duration": "30s",
                } as CSSProperties
              }
            />
          </>
        ) : null}

        {/* Routing lines: draw outward to each pillar */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 z-10 h-full w-full"
          viewBox="0 0 100 100"
          fill="none"
        >
          {SERVICES.map((service, index) => {
            const { x, y } = polar(ANGLES[index]);
            const isActive = activeSlugs.has(service.slug);
            return (
              <motion.line
                key={service.slug}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                stroke={isActive ? "#fd5a01" : "rgba(250, 247, 242, 0.14)"}
                strokeWidth={isActive ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.55, delay: 0.15 + index * 0.09, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Core: the client's system */}
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="relative">
              {active && !reduced ? (
                <span
                  aria-hidden="true"
                  className="absolute -inset-3 animate-pulse-glow rounded-full bg-primary/15 blur-lg"
                />
              ) : null}
              <span
                className={cn(
                  "relative flex size-16 items-center justify-center border bg-background font-display text-xl font-bold tracking-tight sm:size-20 sm:text-2xl",
                  active ? "border-primary shadow-pixel-orange" : "border-border text-muted-foreground"
                )}
              >
                {coreInitials}
              </span>
            </span>
            <span className="max-w-[120px] truncate text-center font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              {active ? MAP.core : coreLabel}
            </span>
          </motion.div>
        </div>

        {/* Pillar nodes */}
        {SERVICES.map((service, index) => {
          const { x, y } = polar(ANGLES[index]);
          const isActive = activeSlugs.has(service.slug);
          return (
            <div
              key={service.slug}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.09, ease: "easeOut" }}
                className="flex w-max flex-col items-center gap-1.5"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2",
                    isActive ? "animate-pulse-glow bg-primary" : "bg-muted-foreground/40"
                  )}
                />
                <span
                  className={cn(
                    "border bg-card px-1.5 py-0.5 text-center font-mono text-[9px] uppercase leading-tight tracking-[0.14em]",
                    isActive
                      ? "border-primary/70 text-foreground"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {/* Index-only below md: full titles would break the square geometry */}
                  <span className="md:hidden">{service.index}</span>
                  <span className="hidden md:inline">
                    {service.index} · {service.title}
                  </span>
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <Reveal delay={0.1}>
        <div className="mt-4 flex items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 bg-primary" />
            {MAP.legendActive}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 bg-muted-foreground/40" />
            {MAP.legendIdle}
          </span>
        </div>
      </Reveal>

      {/* Routing table: which flagged friction lands on which desk */}
      {routed.length > 0 ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {MAP.routing}
          </p>
          <ul className="mt-3 space-y-2.5">
            {routed.map((route, index) => {
              const service = SERVICES.find((item) => item.slug === route.slug);
              return (
                <Reveal as="li" key={route.challenge} delay={0.05 * index} y={14}>
                  <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <span className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {route.challenge}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <MoveRight aria-hidden="true" className="size-3.5 text-primary" />
                      <span className="border border-primary/60 bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                        {service?.index} {service?.title}
                      </span>
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Empty state or honesty note */}
      {active ? (
        <p className="mt-5 border-t border-border pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
          {MAP.note}
        </p>
      ) : (
        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {MAP.empty}
          </p>
          <Button asChild className="mt-4 h-11 font-semibold">
            <Link href="/onboarding">{MAP.emptyCta}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
