import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ESSAYS } from "@/content/insights";
import { INSIGHTS_SECTION } from "@/content/orbyt";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";

/**
 * /insights. Editorial index: large display titles, dek, minutes,
 * hairline rows, straight into the reading pages.
 */
export function InsightsView() {
  return (
    <>
      <PageHero
        id="insights"
        eyebrow={INSIGHTS_SECTION.eyebrow}
        title={INSIGHTS_SECTION.title}
        lede={INSIGHTS_SECTION.lede}
      />

      <Section id="essays" header={null} className="py-16 md:py-20">
        <h2 id="essays-heading" className="sr-only">
          {INSIGHTS_SECTION.title}
        </h2>

        <div className="border-b border-border">
          {ESSAYS.map((essay, i) => (
            <Reveal
              key={essay.slug}
              delay={i * 0.04}
              className="border-t border-border"
            >
              <Link
                href={`/insights/${essay.slug}`}
                className="group grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-10"
              >
                <span className="min-w-0 font-mono text-xs text-muted-foreground md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 md:col-span-9">
                  <span className="block font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                    {essay.title}
                  </span>
                  <span className="mt-2 block max-w-2xl text-base leading-relaxed text-muted-foreground">
                    {essay.dek}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:col-span-2 md:justify-end">
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
    </>
  );
}
