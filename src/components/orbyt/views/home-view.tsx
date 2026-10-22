import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ESSAYS } from "@/content/insights";
import {
  FEATURED_CASE_STUDY,
  INSIGHTS_SECTION,
  PRINCIPLES,
  PROCESS_SECTION,
  PROCESS_STEPS,
  PROBLEM,
  SERVICES,
  SERVICES_SECTION,
  SYSTEMS_SECTION,
  WHY_SECTION,
} from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { BootSequence } from "../boot-sequence";
import { ChainDiagram } from "../chain-diagram";
import { CtaStrip } from "../cta-strip";
import { CurtainReveal } from "../curtain-reveal";
import { emphasize } from "../emphasize";
import { GiantMarquee } from "../giant-marquee";
import { Hero } from "../hero";
import { LeakBoard } from "../leak-board";
import { ManifestoWall } from "../manifesto-wall";
import { ProcessRail } from "../process-rail";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { ServicesWithPreview } from "../services-with-preview";
import { ShowcaseGallery } from "../showcase-gallery";
import { SpotlightCard } from "../spotlight-card";
import { TeamSection } from "../team-section";
import { WorkedWith } from "../worked-with";

/**
 * Home. Rich but composed: every section here is a teaser that hands off
 * to its detail route. Copy comes exclusively from src/content. The boot
 * sequence plays once per session, before anything else.
 */
export function HomeView() {
  return (
    <>
      <BootSequence />
      <Hero />
      <WorkedWith />
      <ShowcaseGallery />
      <GiantMarquee />
      <ManifestoWall />
      <ProblemTeaser />
      <ServicesOverview />
      <ProcessStrip />
      <SystemsTeaser />
      <TeamSection />
      <PrinciplesSection />
      <InsightsTeaser />
      <CtaStrip />
    </>
  );
}

function ProblemTeaser() {
  return (
    <Section
      id="problem"
      eyebrow={PROBLEM.eyebrow}
      title={PROBLEM.title}
      titleAccent={PROBLEM.titleAccent}
      lede={PROBLEM.lede}
    >
      <div className="mt-14 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {PROBLEM.items.map((item, i) => (
            <Reveal
              key={item.fragment}
              delay={(i % 2) * 0.06}
              className="min-w-0 border-t border-dashed border-border"
            >
              <div className="flex gap-4 p-5 md:p-6">
                <span
                  aria-hidden="true"
                  className="shrink-0 pt-0.5 font-mono text-xs text-primary"
                >
                  F-{String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{item.fragment}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.08} className="mt-8">
        <LeakBoard />
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="border border-border bg-card p-6 shadow-pixel-orange md:p-8">
          <p className="text-lg leading-relaxed">{PROBLEM.position}</p>
          <p className="mt-2 font-display text-xl font-bold md:text-2xl">
            {emphasize(PROBLEM.positionAccent, "connects")}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

function ServicesOverview() {
  return (
    <Section
      id="services"
      eyebrow={SERVICES_SECTION.eyebrow}
      title={SERVICES_SECTION.title}
      titleAccent={SERVICES_SECTION.titleAccent}
      lede={SERVICES_SECTION.lede}
    >
      <div className="mt-14">
        <ServicesWithPreview />
      </div>

      <div className="mt-12">
        <ChainDiagram />
      </div>

      <div className="mt-10">
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href={SERVICES_SECTION.detailCta.href}>
            {SERVICES_SECTION.detailCta.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function ProcessStrip() {
  return (
    <Section
      id="process"
      eyebrow={PROCESS_SECTION.eyebrow}
      title={PROCESS_SECTION.title}
      lede={PROCESS_SECTION.lede}
    >
      <div className="relative mt-14">
        {/* The rail: a pulse travels the process, left to right. */}
        <ProcessRail />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal
              key={step.step}
              delay={i * 0.05}
              className="group min-w-0 rounded-xl border border-border bg-card/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 font-mono text-[11px] font-bold text-primary">
                  {step.step}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
              <p className="mt-4 font-display text-lg font-bold uppercase tracking-wide transition-colors duration-200 group-hover:text-primary">
                {step.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.what}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href={PROCESS_SECTION.detailCta.href}>
            {PROCESS_SECTION.detailCta.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function SystemsTeaser() {
  return (
    <Section
      id="systems"
      eyebrow={SYSTEMS_SECTION.eyebrow}
      title={SYSTEMS_SECTION.title}
    >
      {/* Featured Verified Client Case Study */}
      <Reveal className="mt-14">
        <div className="relative overflow-hidden border border-primary/40 bg-card shadow-pixel-orange">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12">
            <div className="p-6 md:p-10 lg:col-span-5">
              <div className="flex items-center gap-2">
                <span className="size-2 animate-pulse bg-emerald-500" />
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  VERIFIED CLIENT CASE STUDY
                </p>
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {FEATURED_CASE_STUDY.client}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {FEATURED_CASE_STUDY.tagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {FEATURED_CASE_STUDY.measured.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/90"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button asChild className="h-10 px-5 text-sm font-semibold">
                  <Link href="/work">
                    See Case Study
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <a
                  href={FEATURED_CASE_STUDY.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Visit sadiasielts.com
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
            <div className="relative aspect-[16/10] w-full min-h-[280px] overflow-hidden border-t border-border bg-stone-950 lg:col-span-7 lg:border-l lg:border-t-0">
              <Image
                src={FEATURED_CASE_STUDY.image}
                alt="Sadia's IELTS Academy live platform mockup"
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 680px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 border border-border bg-card/50 p-6 md:flex-row md:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            PORTFOLIO INTEGRITY
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We only showcase verified production systems built for real clients. Discover our architecture, live telemetry, and delivered stack.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 shrink-0 px-6">
          <Link href="/work">
            View All Work & Case Studies
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function PrinciplesSection() {
  return (
    <Section
      id="why"
      eyebrow={WHY_SECTION.eyebrow}
      title={WHY_SECTION.title}
      lede={WHY_SECTION.lede}
    >
      <div className="mt-14 border-b border-border">
        {PRINCIPLES.map((principle, i) => (
          <Reveal
            key={principle.title}
            delay={i * 0.04}
            className="min-w-0 border-t border-border"
          >
            <div className="grid grid-cols-1 gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-6">
              <span className="font-mono text-xs text-primary md:col-span-2">
                P-{String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="min-w-0 font-display text-lg font-bold tracking-tight md:col-span-4">
                {principle.title}
              </h3>
              <p className="min-w-0 text-sm leading-relaxed text-muted-foreground md:col-span-6">
                {principle.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10">
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href={WHY_SECTION.detailCta.href}>
            {WHY_SECTION.detailCta.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function InsightsTeaser() {
  return (
    <Section
      id="insights"
      eyebrow={INSIGHTS_SECTION.eyebrow}
      title={INSIGHTS_SECTION.title}
      lede={INSIGHTS_SECTION.lede}
    >
      <div className="mt-14 border-b border-border">
        {ESSAYS.map((essay, i) => (
          <Reveal
            key={essay.slug}
            delay={i * 0.04}
            className="border-t border-border"
          >
            <Link
              href={`/insights/${essay.slug}`}
              className="group grid grid-cols-1 gap-4 py-6 md:grid-cols-12 md:items-center md:gap-6 md:py-7"
            >
              <span className="relative block aspect-[16/10] w-full overflow-hidden border border-border sm:max-w-[180px] md:col-span-2">
                <Image
                  src={`/images/essays/${essay.slug}.png`}
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </span>
              <span className="min-w-0 md:col-span-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="min-w-0 md:col-span-7">
                <span className="block font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary md:text-2xl">
                  {essay.title}
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                  {essay.dek}
                </span>
              </span>
              <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:col-span-2 md:justify-end">
                {essay.minutes} MIN READ
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
