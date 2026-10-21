"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SYSTEMS_SECTION } from "@/content/orbyt";
import { Reveal } from "./reveal";
import { Section } from "./section";
import {
  InstrumentCanvas,
  ConsoleClock,
  orbitInstrument,
  carrierInstrument,
  magnetInstrument,
  glyphInstrument,
} from "./console-tiles";
import { cn } from "@/lib/utils";

/* ── ShowcaseGallery → The Console ─────────────────────────
   The wall that could have held photographs holds instruments
   instead. Every tile is computed live: an orbit, a carrier
   stream, a pointer-magnet lattice, a dot-matrix sign and a
   studio clock. Code is the material. */

function InstrumentTile({
  fig,
  title,
  sub,
  className,
  innerClassName,
  children,
}: {
  fig: string;
  title: string;
  sub: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={cn("min-w-0", className)}>
      <figure
        className={cn(
          "group relative h-full overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_36px_rgba(253,90,1,0.14)]",
          innerClassName
        )}
      >
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent"
        />
        <figcaption className="pointer-events-none absolute left-4 right-4 top-3 flex items-baseline justify-between gap-3">
          <span className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {fig} · {title}
          </span>
          <span className="hidden truncate whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
            {sub}
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export function ShowcaseGallery() {
  return (
    <Section
      id="showcase"
      header={null}
      className="overflow-hidden py-16 md:py-20"
    >
      <div className="mx-auto mb-10 flex w-full max-w-6xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Reveal className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            The practice, computed
          </p>
          <h2
            id="showcase-heading"
            className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl"
          >
            Live, <span className="text-primary">not stock.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Nothing on this wall is a photograph. Every tile is a live
            instrument — computed by code, on your machine, right now.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="hidden shrink-0 sm:block">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
          >
            {SYSTEMS_SECTION.detailCta.label}
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:px-8">
        <InstrumentTile
          fig="01"
          title="The orbit"
          sub="Every discipline, one ring"
          className="h-64 sm:col-span-2 md:h-72 lg:col-span-4"
        >
          <InstrumentCanvas
            factory={orbitInstrument}
            label="Interactive digital system loop connecting Web, Ads, Data, AI, and Operations into one ring"
          />
        </InstrumentTile>

        <InstrumentTile
          fig="02"
          title="The clock"
          sub="Dhaka time, always on"
          className="h-64 sm:col-span-2 md:h-72 lg:col-span-2"
        >
          <div className="absolute inset-0">
            <ConsoleClock />
          </div>
        </InstrumentTile>

        <InstrumentTile
          fig="03"
          title="The carrier"
          sub="Small drops, shipped daily"
          className="h-60 lg:col-span-2"
        >
          <InstrumentCanvas
            factory={carrierInstrument}
            label="Live telemetry stream of continuous digital releases and code drops"
          />
        </InstrumentTile>

        <InstrumentTile
          fig="04"
          title="The pull"
          sub="Made to draw people in"
          className="h-60 lg:col-span-2"
        >
          <InstrumentCanvas
            factory={magnetInstrument}
            label="Interactive customer conversion grid funneling visitors toward the center"
          />
        </InstrumentTile>

        <InstrumentTile
          fig="05"
          title="The name"
          sub="Five letters, one system"
          className="h-60 lg:col-span-2"
        >
          <InstrumentCanvas
            factory={glyphInstrument}
            label="Dot-matrix sign cycling the agency verbs ORBYT, BUILD, SCALE and GROW"
          />
        </InstrumentTile>

        <Reveal className="sm:col-span-2 lg:col-span-6">
          <Link
            href="/contact"
            className="btn-shine group flex flex-wrap items-center justify-between gap-4 border border-primary/40 bg-primary/[0.06] px-6 py-7 transition-all duration-300 hover:border-primary/70 hover:bg-primary/10 hover:shadow-[0_0_44px_rgba(253,90,1,0.18)]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                06 · Your move
              </span>
              <span className="mt-1 block font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Start the orbit.
              </span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Start a project
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
