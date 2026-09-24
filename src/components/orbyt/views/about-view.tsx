import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  FOOTER,
  PRINCIPLES,
  PROCESS_SECTION,
  PROCESS_STEPS,
  SITE,
  WHY_SECTION,
} from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";

const INTERSECTIONS = ["TECHNOLOGY", "MARKETING", "OPERATIONS"] as const;

/**
 * /about. Narrative page: what ORBYT is, the name, the full principles,
 * how we work, and the honest closing. No fake team page.
 */
export function AboutView() {
  return (
    <>
      <PageHero
        id="about"
        eyebrow="About ORBYT"
        title={WHY_SECTION.title}
        lede={SITE.tagline}
      />

      {/* What ORBYT is */}
      <Section id="about-what" header={null} className="py-16 md:py-20">
        <h2 id="about-what-heading" className="sr-only">
          What ORBYT is
        </h2>
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            What ORBYT is
          </p>
          <p className="mt-6 max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            {WHY_SECTION.about}
          </p>
        </Reveal>
        <Reveal delay={0.08} className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            {INTERSECTIONS.map((word, i) => (
              <span key={word} className="flex items-center gap-3">
                <span className="border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground/90">
                  {word}
                </span>
                {i < INTERSECTIONS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="font-display text-lg font-bold text-primary"
                  >
                    +
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </Reveal>

        {/* The name */}
        <Reveal delay={0.12} className="mt-12">
          <div className="border border-border bg-card p-8 md:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              The name
            </p>
            <p className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Orbit: movement, momentum, connection.
            </p>
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-muted-foreground">{FOOTER.philosophy}</p>
              <p className="mt-2 font-display text-xl font-bold text-primary md:text-2xl">
                {FOOTER.onward}
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Principles, generous */}
      <Section
        id="about-principles"
        eyebrow="Principles"
        title={WHY_SECTION.lede}
        className="border-t border-border"
      >
        <div className="mt-14 border-b border-border">
          {PRINCIPLES.map((principle, i) => (
            <Reveal
              key={principle.title}
              className="min-w-0 border-t border-border"
            >
              <div className="grid grid-cols-1 gap-3 py-7 md:grid-cols-12 md:gap-6">
                <span className="font-mono text-xs text-primary md:col-span-1">
                  P-{String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="min-w-0 font-display text-xl font-bold tracking-tight md:col-span-4 md:text-2xl">
                  {principle.title}
                </h3>
                <p className="min-w-0 text-base leading-relaxed text-muted-foreground md:col-span-7">
                  {principle.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* How we work */}
      <Section
        id="about-process"
        header={null}
        className="border-t border-border py-16 md:py-20"
      >
        <h2 id="about-process-heading" className="sr-only">
          How we work
        </h2>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              How we work
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {PROCESS_SECTION.lede}
            </p>
            <Button asChild variant="outline" className="mt-7 h-11 px-6">
              <Link href={PROCESS_SECTION.detailCta.href}>
                {PROCESS_SECTION.detailCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.08} className="min-w-0">
            <ol
              aria-label="The six process steps"
              className="flex flex-wrap items-center gap-y-3 border border-border bg-card/50 p-6"
            >
              {PROCESS_STEPS.map((step, i) => (
                <li key={step.step} className="flex items-center">
                  <span className="px-2.5 font-mono text-xs uppercase tracking-[0.18em] text-foreground/80 first:pl-0">
                    {step.name}
                  </span>
                  {i < PROCESS_STEPS.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-primary"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      {/* Honest closing */}
      <Section
        id="about-close"
        header={null}
        className="border-t border-border py-16 md:py-24"
      >
        <h2 id="about-close-heading" className="sr-only">
          Start a project
        </h2>
        <Reveal>
          <p className="max-w-2xl border-l-2 border-primary pl-6 font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
            No fake team page. The people you talk to are the people who build.
          </p>
          <div className="mt-8">
            <Button asChild className="h-12 px-7 text-base font-semibold">
              <Link href={SITE.cta.href}>
                {SITE.cta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
