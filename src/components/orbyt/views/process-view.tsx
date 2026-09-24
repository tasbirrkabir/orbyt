import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROCESS_SECTION, SERVICES_SECTION, SITE } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { ProcessTimeline } from "./process-timeline";

/**
 * /process. The six steps with a scroll-linked progress rail, closed by
 * the loop statement and the CTA.
 */
export function ProcessView() {
  return (
    <>
      <PageHero
        id="process"
        eyebrow={PROCESS_SECTION.eyebrow}
        title={PROCESS_SECTION.title}
        lede={PROCESS_SECTION.lede}
      />

      <Section id="steps" header={null} className="py-16 md:py-24">
        <h2 id="steps-heading" className="sr-only">
          {PROCESS_SECTION.title}
        </h2>

        <ProcessTimeline />

        <Reveal className="mt-16 md:mt-20">
          <div className="border border-border bg-card p-8 shadow-pixel-orange md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              {PROCESS_SECTION.eyebrow}
            </p>
            <p className="mt-4 max-w-2xl font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
              {PROCESS_SECTION.lede}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild className="h-12 px-7 text-base font-semibold">
                <Link href={SITE.cta.href}>
                  {SITE.cta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-7 text-base font-semibold"
              >
                <Link href={SERVICES_SECTION.detailCta.href}>
                  {SERVICES_SECTION.detailCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
