import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTACT, SITE, SYSTEMS_SECTION, SYSTEM_BLUEPRINTS } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";

/**
 * /work. Honest systems: no invented case studies, three blueprint detail
 * panels, then the panel on how engagements actually start.
 */
export function WorkView() {
  return (
    <>
      <PageHero
        id="work"
        eyebrow={SYSTEMS_SECTION.eyebrow}
        title={SYSTEMS_SECTION.title}
      />

      <Section id="systems" header={null} className="py-16 md:py-20">
        <h2 id="systems-heading" className="sr-only">
          {SYSTEMS_SECTION.title}
        </h2>

        {/* Honesty note */}
        <Reveal>
          <p className="max-w-3xl border-l-2 border-primary pl-5 text-lg leading-relaxed text-foreground/90 md:text-xl">
            {SYSTEMS_SECTION.lede}
          </p>
        </Reveal>

        {/* Blueprint detail panels */}
        <div className="mt-14 border-b border-border">
          {SYSTEM_BLUEPRINTS.map((blueprint) => (
            <Reveal key={blueprint.id} className="border-t border-border">
              <article className="grid grid-cols-1 gap-10 py-12 md:py-16 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                    System · {blueprint.id}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {blueprint.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {blueprint.for}
                  </p>
                </div>

                <div className="min-w-0 lg:col-span-7">
                  <p className="max-w-2xl text-base leading-relaxed text-foreground/90">
                    {blueprint.story}
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Components
                      </p>
                      <ul className="mt-3">
                        {blueprint.components.map((component) => (
                          <li key={component} className="flex gap-3 py-1.5">
                            <span
                              aria-hidden="true"
                              className="mt-[9px] size-1.5 shrink-0 bg-primary"
                            />
                            <span className="min-w-0 text-sm leading-relaxed">
                              {component}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {SYSTEMS_SECTION.measuredLabel}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {blueprint.measured.map((metric) => (
                          <li
                            key={metric}
                            className="border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/85"
                          >
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* How engagements start */}
        <Reveal className="mt-14">
          <div className="border border-border bg-card p-8 shadow-pixel-orange md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              How engagements start
            </p>
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {CONTACT.next.title}
            </h3>
            <ol className="mt-6 max-w-2xl divide-y divide-border">
              {CONTACT.next.steps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-xs text-primary"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 text-sm leading-relaxed md:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
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
                <Link href="/process">See the full process</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
