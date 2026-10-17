import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ESSAYS } from "@/content/insights";
import {
  INSIGHTS_SECTION,
  PRINCIPLES,
  PROCESS_SECTION,
  PROCESS_STEPS,
  PROBLEM,
  SERVICES,
  SERVICES_SECTION,
  SYSTEM_BLUEPRINTS,
  SYSTEMS_SECTION,
  WHY_SECTION,
} from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { BootSequence } from "../boot-sequence";
import { ChainDiagram } from "../chain-diagram";
import { CtaStrip } from "../cta-strip";
import { emphasize } from "../emphasize";
import { Hero } from "../hero";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { ServicesWithPreview } from "../services-with-preview";
import { ShowcaseGallery } from "../showcase-gallery";
import { SpotlightCard } from "../spotlight-card";
import { TeamSection } from "../team-section";
import { WorkedWith } from "../worked-with";

const SYSTEM_CARD_IMAGES: Record<string, { src: string; alt: string }> = {
  acquisition: {
    src: "/images/studio/studio-floor.jpg",
    alt: "The studio floor: builders working across monitors",
  },
  "ai-ops": {
    src: "/images/studio/code-screens.jpg",
    alt: "Production code on screens in a dark workspace",
  },
  "connected-web": {
    src: "/images/studio/collab-review.jpg",
    alt: "Two people reviewing a build together at a laptop",
  },
};

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
      <div className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {PROCESS_STEPS.map((step, i) => (
          <Reveal
            key={step.step}
            delay={i * 0.05}
            className="group min-w-0 bg-background p-6 transition-colors duration-200 hover:bg-card"
          >
            <p className="font-mono text-xs text-primary">{step.step}</p>
            <p className="mt-3 font-display text-lg font-bold uppercase tracking-wide transition-colors duration-200 group-hover:text-primary">
              {step.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.what}
            </p>
          </Reveal>
        ))}
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
      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {SYSTEM_BLUEPRINTS.map((blueprint, i) => {
          const img = SYSTEM_CARD_IMAGES[blueprint.id];
          return (
            <Reveal key={blueprint.id} delay={i * 0.06} className="min-w-0">
              <SpotlightCard className="h-full">
                {img ? (
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-border">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 768px) 360px, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover/spot:scale-[1.05]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 group-hover/spot:text-primary">
                    {blueprint.id}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-bold tracking-tight transition-colors duration-200 group-hover/spot:text-primary">
                    {blueprint.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {blueprint.for}
                  </p>
                </div>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-10">
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href={SYSTEMS_SECTION.detailCta.href}>
            {SYSTEMS_SECTION.detailCta.label}
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
                  src={`/images/essays/${essay.slug}.jpg`}
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
