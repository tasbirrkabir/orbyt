import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, CheckCircle2, Zap, Globe, Gauge, ShieldCheck } from "lucide-react";
import {
  CONTACT,
  FEATURED_CASE_STUDY,
  SITE,
  SYSTEMS_SECTION,
} from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { cn } from "@/lib/utils";

/* Process band — original ORBYT renders, one per step */
const STUDIO_BAND = [
  { src: "/images/art/discover-contour.png", label: "DISCOVER", sub: "Mapping the shape of the system" },
  { src: "/images/art/build-blocks.png", label: "BUILD", sub: "Shipped in small, deliberate layers" },
  { src: "/images/art/connect-corridor.png", label: "CONNECT", sub: "Follow-up that actually lands" },
  { src: "/images/art/grow-terrace.png", label: "GROW", sub: "The view the system earns" },
];

/**
 * /work. Verified Client Work & Case Studies.
 * Zero placeholder filler. Centered on Sadia's IELTS Academy as a live,
 * verified client deployment engineered by ORBYT.
 */
export function WorkView() {
  return (
    <>
      <PageHero
        id="work"
        eyebrow="CLIENT WORK & CASE STUDIES"
        title="Verified Systems in Production."
      />

      <Section id="systems" header={null} className="py-16 md:py-20">
        <h2 id="systems-heading" className="sr-only">
          Client Work & Case Studies
        </h2>

        {/* Portfolio integrity note */}
        <Reveal>
          <div className="max-w-3xl border-l-2 border-primary pl-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              HONESTY BY DESIGN
            </p>
            <p className="mt-2 text-lg leading-relaxed text-foreground/90 md:text-xl">
              We do not invent fake case studies, and we do not use mock filler logos. Every deployment featured here is an active, production-grade system built and delivered for real client operations.
            </p>
          </div>
        </Reveal>

        {/* FEATURED CASE STUDY: SADIA'S IELTS ACADEMY */}
        <div className="mt-14 space-y-12">
          {/* Main Showcase Hero Card */}
          <Reveal className="border border-primary/40 bg-card p-6 md:p-10 shadow-pixel-orange">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  VERIFIED CLIENT CASE STUDY // 01
                </span>
                <span className="hidden text-muted-foreground sm:inline">·</span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  EDTECH CONVERSION SYSTEM
                </span>
              </div>
              <a
                href={FEATURED_CASE_STUDY.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-primary transition-colors hover:underline"
              >
                sadiasielts.com
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="min-w-0 lg:col-span-5">
                <h3 className="font-display text-3xl font-bold leading-[1.08] tracking-tight md:text-4xl">
                  {FEATURED_CASE_STUDY.client}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-foreground/90">
                  {FEATURED_CASE_STUDY.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {FEATURED_CASE_STUDY.story}
                </p>

                {/* Delivered Architecture Checklist */}
                <div className="mt-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    DELIVERED ARCHITECTURE
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {FEATURED_CASE_STUDY.components.map((c) => (
                      <li key={c} className="flex items-start gap-2.5 text-xs text-foreground/90 md:text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live Metrics */}
                <div className="mt-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    MEASURED OUTCOMES
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {FEATURED_CASE_STUDY.measured.map((m) => (
                      <div
                        key={m}
                        className="border border-border bg-background/80 p-3"
                      >
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                          {m}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button asChild className="h-11 px-6 font-semibold">
                    <a
                      href={FEATURED_CASE_STUDY.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      Visit Live Website
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Studio Mockup Poster Frame */}
              <div className="min-w-0 lg:col-span-7">
                <div className="relative aspect-[16/10] w-full min-h-[320px] overflow-hidden border border-border bg-stone-950 shadow-pixel-orange">
                  <Image
                    src={FEATURED_CASE_STUDY.image}
                    alt="Sadia's IELTS Academy live homepage displayed inside a studio monitor mockup"
                    fill
                    priority
                    unoptimized
                    sizes="(min-width: 1024px) 720px, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-1 font-mono text-[11px] text-muted-foreground">
                  <span>STUDIO DISPLAY // SADIA'S IELTS HOMEPAGE</span>
                  <span className="text-primary">BUILT BY ORBYT</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Deep Architectural Breakdown Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Reveal delay={0.05} className="border border-border bg-card p-6 md:p-8">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="size-5" />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                CORE WEB PERFORMANCE
              </p>
              <h4 className="mt-2 font-display text-xl font-bold">
                0.38s Edge Delivery
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Eliminated hydration bottlenecks and optimized static delivery so international students on mobile connections experience immediate, zero-lag course exploration.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="border border-border bg-card p-6 md:p-8">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-5" />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                DESTINATION ROUTING
              </p>
              <h4 className="mt-2 font-display text-xl font-bold">
                6 Country Prep Funnels
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Built customized intake tracks for UK, Canada, Australia, USA, Sweden, and Germany — connecting students directly with tailored visa guidance and Cambridge preparation syllabus.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="border border-border bg-card p-6 md:p-8">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                ADMISSION CONVERSION
              </p>
              <h4 className="mt-2 font-display text-xl font-bold">
                +44% Inquiry Velocity
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Automated lead capture, WhatsApp routing, and batch scheduling removed the manual counseling bottleneck, creating direct pipeline conversion into active student batches.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Pipeline & Honest Notice */}
        <Reveal className="mt-16 border border-dashed border-border bg-card/30 p-8 md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  PIPELINE STATUS
                </p>
              </div>
              <h4 className="mt-2 font-display text-xl font-bold md:text-2xl">
                Upcoming Client Systems in Active Build
              </h4>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                We are currently engineering custom systems across healthcare intake automation, B2B wholesale logistics, and real estate acquisition. Case studies are published upon deployment and client release.
              </p>
            </div>
            <Button asChild variant="outline" className="h-11 shrink-0 px-6 font-semibold">
              <Link href="/contact">
                Discuss Your System
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Process band */}
        <div className="mt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  THE METHODOLOGY
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                  How an ORBYT System Comes Together
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
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                    <Image
                      src={shot.src}
                      alt={shot.sub}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
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
          <div className="beam-border border border-border bg-card p-8 shadow-pixel-orange md:p-12">
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
