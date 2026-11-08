import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Gauge,
  Layers,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { SiteShell } from "@/components/orbyt/site-shell";
import { PageHero } from "@/components/orbyt/page-hero";
import { Section } from "@/components/orbyt/section";
import { SpotlightCard } from "@/components/orbyt/spotlight-card";
import { Button } from "@/components/ui/button";
import { BreadcrumbsJsonLd, CaseStudyJsonLd } from "@/components/seo/json-ld";
import { CASE_STUDIES, getCaseStudy, SITE } from "@/content/orbyt";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CASE_STUDIES.map((cs) => ({ slug: cs.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) {
    return { title: "Case Study Not Found | ORBYT ONWARD" };
  }

  const title = `${cs.client} Case Study | ORBYT ONWARD`;
  const description = `How ORBYT ONWARD engineered a high-converting web platform and digital systems architecture for ${cs.client} in Bangladesh.`;
  const canonicalUrl = `/work/${cs.id}`;
  const imageUrl = cs.image.startsWith("http")
    ? cs.image
    : `https://orbytonward.tech${cs.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `https://orbytonward.tech/work/${cs.id}`,
      siteName: "ORBYT ONWARD",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cs.client} Case Study by ORBYT ONWARD`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Work", url: "/work" },
    { name: cs.client, url: `/work/${cs.id}` },
  ];

  const otherCaseStudies = CASE_STUDIES.filter((c) => c.id !== cs.id);

  return (
    <SiteShell>
      <CaseStudyJsonLd
        title={cs.title}
        description={cs.story}
        url={`https://orbytonward.tech/work/${cs.id}`}
        client={cs.client}
        imageUrl={`https://orbytonward.tech${cs.image}`}
      />
      <BreadcrumbsJsonLd items={breadcrumbs} />

      {/* Breadcrumb Bar */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 font-mono text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <Link href="/work" className="transition-colors hover:text-primary">
            Work
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="truncate text-primary">{cs.client}</span>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        id="case-study-hero"
        eyebrow={cs.category}
        title={cs.client}
        titleAccent={cs.challengeAccent || "Engineered by ORBYT ONWARD"}
        lede={cs.tagline}
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <a
              href={cs.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Visit Live Website
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="h-12 px-7 text-base font-semibold">
            <Link href={SITE.cta.href}>Engineer Your Platform</Link>
          </Button>
        </div>
      </PageHero>

      {/* Showcase Visual */}
      <div className="border-b border-border bg-black/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-stone-950 shadow-2xl">
            <Image
              src={cs.image}
              alt={`${cs.client} showcase designed and developed by ORBYT ONWARD`}
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(min-width: 1200px) 1152px, 100vw"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
            <span>CLIENT: {cs.client} ({cs.url.replace(/^https?:\/\//, "").replace(/\/$/, "")})</span>
            <span>{cs.stackNote || "STACK: Next.js · TypeScript · Tailwind CSS · Vercel Edge"}</span>
          </div>

          {cs.screenImage && (
            <div className="mt-8 border border-border bg-stone-950 p-4 rounded-lg">
              <p className="font-mono text-[11px] uppercase tracking-wider text-primary mb-3">
                DETAIL VIEW // HIGH-RESOLUTION SCREEN FRAME
              </p>
              <div className="relative aspect-[5/3] w-full overflow-hidden rounded border border-border/60">
                <Image
                  src={cs.screenImage}
                  alt={`${cs.client} detailed screen view`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1200px) 1152px, 100vw"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="border-b border-border bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {cs.measured.map((m, idx) => (
              <div key={m} className="border-l-2 border-primary pl-4">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-primary">
                  {m.split(" ")[0]}
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {m.split(" ").slice(1).join(" ") || `Metric 0${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge & Context */}
      <Section
        id="context"
        eyebrow="THE CHALLENGE"
        title={cs.challengeTitle || "The Operational Context"}
        titleAccent={cs.challengeAccent || "and Strategic Bottlenecks"}
        lede={cs.challengeLede || cs.story}
      >
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <SpotlightCard className="p-8">
            <h3 className="text-xl font-bold">The Operational Bottlenecks</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {(cs.bottlenecks || [
                "Fragmented communication channels and manual inquiry qualification.",
                "High latency on mobile connections causing prospective customers to bounce.",
                "Lack of unified tracking between ad channels and customer conversion touchpoints.",
              ]).map((bn) => (
                <li key={bn} className="flex items-start gap-2.5">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{bn}</span>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <h3 className="text-xl font-bold">The Strategic Objective</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {cs.story}
            </p>
            {cs.objective && (
              <div className="mt-6 rounded-lg border border-border bg-card/60 p-4 font-mono text-xs text-primary">
                {cs.objective}
              </div>
            )}
          </SpotlightCard>
        </div>
      </Section>

      {/* The Solution */}
      <Section
        id="solution"
        eyebrow="ENGINEERED SOLUTION"
        title={cs.solutionTitle || "Architected for Performance"}
        titleAccent={cs.solutionAccent || "and Commercial Conversion."}
        lede={cs.solutionLede || "ORBYT ONWARD designed and engineered a custom web architecture from the ground up, prioritizing mobile performance, clear typography, and zero-friction inquiry capture."}
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {(cs.pillars || [
            {
              title: "Sub-Second Rendering",
              desc: "Built on Next.js with edge caching, asset preloading, and responsive image compression.",
            },
            {
              title: "Automated Lead Routing",
              desc: "Inquiry forms qualify customers and route records directly to operations without manual re-entry.",
            },
            {
              title: "Measurement Architecture",
              desc: "Integrated conversion tracking captures every meaningful user event across all channels.",
            },
          ]).map((p, i) => {
            const Icon = i === 0 ? Zap : i === 1 ? Workflow : Gauge;
            return (
              <SpotlightCard key={p.title} className="p-7">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </SpotlightCard>
            );
          })}
        </div>
      </Section>

      {/* Delivered Components */}
      <Section
        id="architecture"
        eyebrow="DELIVERED SYSTEM COMPONENTS"
        title="Full-surface software deliverables."
        lede="Every layer of the deployment was engineered to operate as a unified system."
      >
        <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cs.components.map((comp) => (
              <div key={comp} className="flex items-center gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Other Case Studies */}
      {otherCaseStudies.length > 0 && (
        <Section
          id="other-work"
          eyebrow="MORE DEPLOYMENTS"
          title="Explore More Verified Client Work."
          lede="See how other businesses in Bangladesh and abroad scale using connected digital systems."
        >
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {otherCaseStudies.map((other) => (
              <SpotlightCard key={other.id} className="p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-wider text-primary">
                  {other.category}
                </p>
                <h4 className="mt-2 text-2xl font-bold">{other.client}</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {other.tagline}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Button asChild size="sm" className="font-semibold">
                    <Link href={`/work/${other.id}`}>
                      View Case Study <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section
        id="cta"
        eyebrow="SIMILAR RESULTS FOR YOUR BUSINESS"
        title="Ready to engineer a high-converting"
        titleAccent="software platform for your company?"
        lede="Let's build a fast, measurable digital system tailored to your exact operational requirements."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
            <Link href={SITE.cta.href}>
              {SITE.cta.label}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold">
            <Link href="/work">View All Work</Link>
          </Button>
        </div>
      </Section>
    </SiteShell>
  );
}
