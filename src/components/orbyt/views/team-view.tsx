import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE, TEAM } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { emphasize } from "../emphasize";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { SpotlightCard } from "../spotlight-card";

/**
 * /team. The crew, presented as roles: what each seat owns, the questions
 * it answers, and the three ways the crew plugs into a business. Nothing
 * invented: no headshots, no fake names, no fake bios.
 */
export function TeamView() {
  return (
    <>
      <PageHero
        id="team"
        eyebrow={TEAM.eyebrow}
        title={TEAM.title}
        titleAccent={TEAM.titleAccent}
        lede={TEAM.lede}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <Link href={TEAM.detailCta.href}>
              {TEAM.detailCta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-7 text-base font-semibold"
          >
            <Link href={SITE.secondaryCta.href}>
              {SITE.secondaryCta.label}
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* The crew */}
      <Section id="crew" eyebrow="THE SEATS" title="Who actually does the work.">
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {TEAM.crew.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.05} className="h-full">
              <SpotlightCard className="p-6 md:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                    {member.id}
                  </p>
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs text-foreground/20 transition-colors duration-200 group-hover/spot:text-primary/60"
                  >
                    +
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight transition-colors duration-200 group-hover/spot:text-primary">
                  {member.role}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {member.tagline}
                </p>
                <div className="mt-6 border-t border-dashed border-border pt-5">
                  <p className="text-sm font-medium">{member.owns}</p>
                  <ul className="mt-3 space-y-1.5">
                    {member.answers.map((question) => (
                      <li
                        key={question}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 font-mono text-xs text-primary"
                        >
                          +
                        </span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The promise, loud */}
      <section
        aria-label="The promise"
        className="border-y border-border bg-blueprint"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              THE PROMISE
            </p>
            <p className="mt-5 max-w-3xl font-display text-2xl font-bold leading-[1.15] tracking-tight sm:text-3xl md:text-4xl">
              {emphasize(TEAM.promise, TEAM.promiseWord)}
            </p>
          </Reveal>
        </div>
      </section>

      {/* How the crew runs */}
      <Section
        id="crew-rules"
        eyebrow={TEAM.how.eyebrow}
        title={TEAM.how.title}
      >
        <div className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {TEAM.how.items.map((item, i) => (
            <Reveal
              key={item.k}
              delay={i * 0.05}
              className="group min-w-0 bg-background p-6 transition-colors duration-200 hover:bg-card md:p-8"
            >
              <p className="font-mono text-xs text-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-wide">
                {item.k}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.v}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Ways to plug in */}
      <Section
        id="crew-ways"
        eyebrow={TEAM.ways.eyebrow}
        title={TEAM.ways.title}
      >
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEAM.ways.items.map((way, i) => (
            <Reveal key={way.name} delay={i * 0.06} className="h-full">
              <SpotlightCard className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {way.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {way.v}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <div className="border border-dashed border-border bg-card/50 p-6 md:p-8">
            <p className="text-base leading-relaxed text-muted-foreground">
              {TEAM.note}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <Link href={TEAM.detailCta.href}>
              {TEAM.detailCta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
