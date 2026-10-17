import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/content/orbyt";
import {
  CONTACT,
  HERO,
  SERVICES,
  SERVICES_SECTION,
  SITE,
} from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { ChainDiagram } from "../chain-diagram";
import { emphasize } from "../emphasize";
import { PageHero } from "../page-hero";
import { ParallaxImage } from "../parallax-image";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { cn } from "@/lib/utils";

const SERVICE_IMAGES: Record<string, { src: string; caption: string }> = {
  "ai-automation": {
    src: "/images/showcase/showcase-06.png",
    caption: "Intelligence wired into the core.",
  },
  "web-digital": {
    src: "/images/showcase/showcase-01.png",
    caption: "Surfaces that report while they perform.",
  },
  "growth-marketing": {
    src: "/images/showcase/showcase-03.png",
    caption: "Channels as one connected mesh.",
  },
  "data-tracking": {
    src: "/images/showcase/showcase-02.png",
    caption: "Signal, streaming honestly.",
  },
  "digital-systems": {
    src: "/images/showcase/showcase-07.png",
    caption: "Tools moving work, not people chasing tools.",
  },
};

/**
 * /services. Full pillar detail: one editorial section per service,
 * alternating left/right rhythm on large screens, closed by the chain
 * diagram and the big CTA panel.
 */
export function ServicesView() {
  return (
    <>
      <PageHero
        id="services"
        eyebrow={SERVICES_SECTION.eyebrow}
        title={SERVICES_SECTION.title}
        titleAccent={SERVICES_SECTION.titleAccent}
        lede={SERVICES_SECTION.lede}
      />

      {SERVICES.map((service, i) => (
        <ServiceBlock
          key={service.slug}
          service={service}
          flip={i % 2 === 1}
          first={i === 0}
        />
      ))}

      <Section
        id="services-close"
        header={null}
        className="border-t border-border py-16 md:py-24"
      >
        <h2 id="services-close-heading" className="sr-only">
          Start a project
        </h2>
        <ChainDiagram />
        <Reveal className="mt-10">
          <div className="border border-border bg-card p-8 shadow-pixel-orange md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              {CONTACT.eyebrow}
            </p>
            <p className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {emphasize(HERO.titleA, "system")}
              <span className="block">{HERO.titleB}</span>
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
                <Link href={SITE.secondaryCta.href}>
                  {SITE.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function ServiceBlock({
  service,
  flip,
  first,
}: {
  service: Service;
  flip: boolean;
  first: boolean;
}) {
  return (
    <Section
      id={service.slug}
      header={null}
      className={cn("py-16 md:py-20", !first && "border-t border-border")}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Story: index, title, what, why */}
        <div className={cn("min-w-0 lg:col-span-5", flip && "lg:order-2")}>
          <Reveal>
            <p className="font-mono text-xs tracking-[0.18em] text-primary">
              {service.index}
            </p>
            <h2
              id={`${service.slug}-heading`}
              className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl"
            >
              {service.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {service.what}
            </p>
            <div className="mt-7 border-l-2 border-primary pl-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Why
              </p>
              <p className="mt-2 text-base leading-relaxed">{service.why}</p>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="mt-8">
            <ParallaxImage
              src={SERVICE_IMAGES[service.slug]?.src ?? "/images/showcase/showcase-04.png"}
              alt={`Rendered visual for ${service.title}`}
              label={`Service ${service.index}`}
              caption={SERVICE_IMAGES[service.slug]?.caption}
            />
          </Reveal>
        </div>

        {/* Proof: signs, builds, connects, outcome */}
        <div className={cn("min-w-0 lg:col-span-7", flip && "lg:order-1")}>
          <Reveal delay={0.08}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Signs you need it
            </p>
            <ul className="mt-3">
              {service.signs.map((sign) => (
                <MarkerListItem key={sign}>{sign}</MarkerListItem>
              ))}
            </ul>

            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              What we build
            </p>
            <ul className="mt-3">
              {service.builds.map((item) => (
                <MarkerListItem key={item}>{item}</MarkerListItem>
              ))}
            </ul>

            <p className="mt-8 border-t border-border pt-5 font-mono text-xs uppercase tracking-[0.18em]">
              <span className="text-muted-foreground">Connects:</span>{" "}
              <span className="text-foreground/85">{service.connects}</span>
            </p>

            <div className="mt-6 border border-border bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Outcome
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {service.outcome}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function MarkerListItem({ children }: { children: string }) {
  return (
    <li className="flex gap-3 py-1.5">
      <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 bg-primary" />
      <span className="min-w-0 text-sm leading-relaxed">{children}</span>
    </li>
  );
}
