"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Layers, ShieldCheck, Zap } from "lucide-react";
import type { ServiceDetail } from "@/content/services-data";
import { DETAILED_SERVICES } from "@/content/services-data";
import { SITE, CONTACT } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { PageHero } from "../page-hero";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { SpotlightCard } from "../spotlight-card";

export function ServiceDetailView({ service }: { service: ServiceDetail }) {
  const otherServices = DETAILED_SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <>
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 font-mono text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <Link href="/services" className="transition-colors hover:text-primary">
            Services
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="truncate text-primary">{service.title}</span>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        id={service.slug}
        eyebrow={`SERVICE ${service.index} // ${service.category.toUpperCase()}`}
        title={service.title}
        lede={service.heroHeadline}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <Link href={SITE.cta.href}>
              {SITE.cta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-7 text-base font-semibold">
            <Link href="#deliverables">See Deliverables</Link>
          </Button>
        </div>
      </PageHero>

      {/* Overview & Visual */}
      <Section id="overview" header={null} className="py-16 md:py-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Detailed Explanatory Copy */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                THE ARCHITECTURAL APPROACH
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Engineered for production durability.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-foreground/90 md:text-lg">
                {service.what}
              </p>
              <div className="mt-7 border-l-2 border-primary pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  The Core Rationale
                </p>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {service.why}
                </p>
              </div>
            </Reveal>

            {/* Signs You Need This Service */}
            <div className="mt-12">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                IDENTIFYING THE BOTTLENECK // SIGNS YOU NEED THIS
              </p>
              <ul className="mt-4 space-y-3">
                {service.signs.map((sign, i) => (
                  <Reveal key={sign} delay={i * 0.05}>
                    <li className="flex items-start gap-3 border border-border bg-card/40 p-4">
                      <span className="mt-0.5 size-1.5 shrink-0 bg-primary" />
                      <span className="text-sm leading-relaxed text-foreground/90">{sign}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Art & Outcome Card */}
          <div className="min-w-0 lg:col-span-5">
            <Reveal delay={0.08}>
              <div className="overflow-hidden border border-border bg-card shadow-pixel-orange">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 460px, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
                  />
                </div>
                <div className="p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                    Fig. {service.index} — {service.imageCaption}
                  </p>
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Connects Into
                    </p>
                    <p className="mt-1 font-mono text-xs text-foreground/85">
                      {service.connects}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                      Measured Outcome
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                      {service.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Deliverables & What We Build */}
      <Section
        id="deliverables"
        eyebrow="SCOPE & SPECIFICATION"
        title="What ORBYT ONWARD Delivers."
        lede="No vague retainers. Every engagement produces clear, production-grade assets and documentation."
        className="border-t border-border py-16 md:py-20"
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Engineering Scope */}
          <Reveal>
            <div className="h-full border border-border bg-card p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Layers className="size-5 text-primary" />
                <h3 className="font-display text-xl font-bold tracking-tight">
                  Core Engineering Scope
                </h3>
              </div>
              <ul className="mt-6 space-y-3">
                {service.builds.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Hard Deliverables */}
          <Reveal delay={0.08}>
            <div className="h-full border border-border bg-card p-6 md:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-display text-xl font-bold tracking-tight">
                  Handover Deliverables
                </h3>
              </div>
              <ul className="mt-6 space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Verified Technology Stack */}
        <div className="mt-12 border border-dashed border-border bg-card/30 p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            VERIFIED TECHNOLOGY STACK & PLATFORMS
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {service.technologies.map((tech) => (
              <span
                key={tech}
                className="border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Real-World Use Cases */}
      <Section
        id="use-cases"
        eyebrow="DEPLOYMENT SCENARIOS"
        title="Real-World Implementation Use Cases."
        className="border-t border-border py-16 md:py-20"
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {service.useCases.map((uc, i) => (
            <Reveal key={uc.title} delay={i * 0.08} className="h-full">
              <SpotlightCard className="h-full p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  SCENARIO 0{i + 1}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                  {uc.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {uc.description}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Verified Work Anchor / Sadia's IELTS */}
      <Section
        id="case-study-ref"
        header={null}
        className="border-t border-border py-16"
      >
        <div className="border border-primary/40 bg-card p-6 md:p-10 shadow-pixel-orange">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                PROVEN IN PRODUCTION // CLIENT CASE STUDY
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                Sadia's IELTS Academy
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Delivered a conversion-first Next.js web application with 0.38s Largest Contentful Paint, structured admission funnels, and automated WhatsApp inquiry routing resulting in a 44% lift in admissions velocity.
              </p>
            </div>
            <Button asChild className="h-11 shrink-0 px-6 font-semibold">
              <Link href="/work/sadias-ielts">
                View Full Case Study
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section
        id="faq"
        eyebrow="FREQUENTLY ASKED QUESTIONS"
        title="Technical & Commercial FAQs."
        lede="Straight answers about how we build, deploy, and maintain software systems."
        className="border-t border-border py-16 md:py-20"
      >
        <div className="mt-12 max-w-3xl divide-y divide-border border-y border-border">
          {service.faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.05} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                <HelpCircle className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Related Services Navigation */}
      <Section
        id="related-services"
        eyebrow="CONNECTED CAPABILITIES"
        title="Other Services in the ORBYT Ecosystem."
        className="border-t border-border py-16 md:py-20"
      >
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherServices.slice(0, 3).map((os) => (
            <Reveal key={os.slug}>
              <Link
                href={`/services/${os.slug}`}
                className="group block border border-border bg-card/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  SERVICE {os.index}
                </p>
                <h4 className="mt-2 font-display text-lg font-bold group-hover:text-primary">
                  {os.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {os.short}
                </p>
                <div className="mt-4 flex items-center gap-1 font-mono text-xs text-primary">
                  <span>Explore service</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Primary Conversion CTA Panel */}
      <Section id="cta" header={null} className="border-t border-border py-16 md:py-24">
        <Reveal>
          <div className="border border-border bg-card p-8 shadow-pixel-orange md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              READY TO BUILD?
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Discuss Your {service.title} Project.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Tell us about your operational bottleneck, timeline, and goals. We will provide an honest architectural assessment and what we recommend building first.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild className="h-12 px-7 text-base font-semibold">
                <Link href={SITE.cta.href}>
                  Start a Project Conversation
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-7 text-base font-semibold">
                <Link href="/services">View All Services</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
