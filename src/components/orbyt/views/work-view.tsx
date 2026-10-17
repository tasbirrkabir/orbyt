import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CONTACT, SITE, SYSTEMS_SECTION, SYSTEM_BLUEPRINTS } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { ParallaxImage } from "../parallax-image";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { cn } from "@/lib/utils";

const SYSTEM_IMAGES: Record<string, { src: string; caption: string; alt: string }> = {
  acquisition: {
    src: "/images/art/signal-path.png",
    caption: "Every build starts as a map, not a mockup.",
    alt: "Abstract topographic map with one glowing orange route crossing it",
  },
  "ai-ops": {
    src: "/images/art/circuit-weave.png",
    caption: "The machinery behind it, running in code.",
    alt: "Abstract circuit traces weaving into one glowing path",
  },
  "connected-web": {
    src: "/images/art/particle-flow.png",
    caption: "And every page, reviewed as one connected surface.",
    alt: "Streams of glowing particles converging into a single point",
  },
};

const STUDIO_BAND = [
  { src: "/images/art/aperture.png", label: "DISCOVER", sub: "Mapping the shape of the system" },
  { src: "/images/art/lattice.png", label: "BUILD", sub: "Sprints with owners and deadlines" },
  { src: "/images/art/data-pulse.png", label: "CONNECT", sub: "Walking the data with you" },
  { src: "/images/art/wave-field.png", label: "GROW", sub: "Reviewing what the system earned" },
];

/**
 * /work. An editorial systems showcase: three blueprint panels with
 * alternating custom-render layouts, a process band drawn in the same
 * "Ink & Ember" language, then the panel on how engagements actually
 * start. No invented case studies — ORBYT has no office to photograph,
 * so the practice is shown as the system it is (honesty rule).
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

        {/* Blueprint detail panels — alternating editorial layout */}
        <div className="mt-16 border-b border-border">
          {SYSTEM_BLUEPRINTS.map((blueprint, i) => {
            const img = SYSTEM_IMAGES[blueprint.id];
            const flip = i % 2 === 1;
            return (
              <Reveal key={blueprint.id} className="border-t border-border">
                <article className="grid grid-cols-1 items-start gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
                  {/* Copy column */}
                  <div
                    className={cn(
                      "min-w-0 lg:col-span-5",
                      flip && "lg:order-2"
                    )}
                  >
                    <div className="lg:sticky lg:top-24">
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                        System · {String(i + 1).padStart(2, "0")} · {blueprint.id}
                      </p>
                      <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-4xl">
                        {blueprint.title}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        {blueprint.for}
                      </p>

                      <div className="mt-8">
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

                      <div className="mt-8">
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

                  {/* Story + photo column */}
                  <div className={cn("min-w-0 lg:col-span-7", flip && "lg:order-1")}>
                    {img ? (
                      <ParallaxImage
                        src={img.src}
                        alt={img.alt}
                        label={blueprint.id.toUpperCase()}
                        caption={img.caption}
                        priority={i === 0}
                        travel={flip ? -30 : 34}
                      />
                    ) : null}

                    <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-foreground/90 md:text-xl">
                      {blueprint.story}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Process band */}
        <div className="mt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  The practice, drawn
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                  How a system comes together
                </h3>
              </div>
              <Link
                href="/process"
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
              >
                The full process
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STUDIO_BAND.map((shot, i) => (
              <Reveal key={shot.src} delay={i * 0.06} className="min-w-0">
                <figure className="tint-sweep group relative overflow-hidden border border-border bg-card transition-colors duration-300 hover:border-primary/60">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={shot.src}
                      alt={shot.sub}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
                    />
                  </div>
                  <figcaption className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      {String(i + 1).padStart(2, "0")} · {shot.label}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-foreground/90">
                      {shot.sub}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        {/* How engagements start */}
        <Reveal className="mt-20">
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
