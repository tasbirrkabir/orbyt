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
import { FEATURED_CASE_STUDY, SITE } from "@/content/orbyt";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [{ slug: "sadias-ielts" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "sadias-ielts") {
    return { title: "Case Study Not Found | ORBYT ONWARD" };
  }

  const title = "Sadia's IELTS Academy Case Study | ORBYT ONWARD";
  const description =
    "How ORBYT ONWARD engineered a high-converting Next.js web application, 0.38s LCP performance, and automated student enrollment system for Sadia's IELTS Academy in Bangladesh.";
  const canonicalUrl = "/work/sadias-ielts";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `https://orbytonward.tech/work/sadias-ielts`,
      siteName: "ORBYT ONWARD",
      type: "article",
      images: [
        {
          url: "https://orbytonward.tech/images/art/sadias-ielts-showcase.png",
          width: 1200,
          height: 630,
          alt: "Sadia's IELTS Academy Case Study by ORBYT ONWARD",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://orbytonward.tech/images/art/sadias-ielts-showcase.png"],
    },
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== "sadias-ielts") {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Work", url: "/work" },
    { name: "Sadia's IELTS Academy", url: "/work/sadias-ielts" },
  ];

  return (
    <SiteShell>
      <CaseStudyJsonLd
        title="Sadia's IELTS Academy: EdTech Web & Enrollment Architecture"
        description="How ORBYT ONWARD engineered a high-converting web platform and automated student admissions pipeline for Sadia's IELTS Academy in Bangladesh."
        url="https://orbytonward.tech/work/sadias-ielts"
        client="Sadia's IELTS Academy"
        imageUrl="https://orbytonward.tech/images/art/sadias-ielts-showcase.png"
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
          <span className="truncate text-primary">Sadia&apos;s IELTS Academy</span>
        </div>
      </div>

      {/* Hero */}
      <PageHero
        id="case-study-hero"
        eyebrow="CLIENT CASE STUDY // EDTECH PLATFORM & CONVERSION ARCHITECTURE"
        title="Sadia's IELTS Academy"
        titleAccent="0.38s LCP, +44% Admissions Lift."
        lede="How ORBYT ONWARD designed, engineered, and deployed a high-velocity web platform and automated student enrollment architecture for Bangladesh's premier IELTS mentoring academy."
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <a
              href="https://sadiasielts.com/"
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
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-stone-950 shadow-2xl">
            <Image
              src="/images/art/sadias-ielts-showcase.png"
              alt="Sadia's IELTS Academy website displayed in studio monitor mockup"
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(min-width: 1200px) 1152px, 100vw"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
            <span>CLIENT: Sadia&apos;s IELTS Academy (sadiasielts.com)</span>
            <span>STACK: Next.js · TypeScript · Tailwind CSS · Vercel Edge</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="border-b border-border bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="border-l-2 border-primary pl-4">
              <div className="font-mono text-3xl font-bold text-primary">0.38s</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Largest Contentful Paint
              </div>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <div className="font-mono text-3xl font-bold text-primary">+44%</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Admissions Conversion Lift
              </div>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <div className="font-mono text-3xl font-bold text-primary">6</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Global Study Destinations
              </div>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <div className="font-mono text-3xl font-bold text-primary">100%</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Automated Lead Pipeline
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge & Context */}
      <Section
        id="context"
        eyebrow="THE CHALLENGE"
        title="High student demand hindered by"
        titleAccent="manual inquiry bottlenecks."
        lede="Sadia's IELTS is one of Bangladesh's premier IELTS mentoring brands, preparing hundreds of students each year for overseas university admissions in the UK, Canada, Australia, USA, Sweden, and Germany."
      >
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <SpotlightCard className="p-8">
            <h3 className="text-xl font-bold">The Operational Bottlenecks</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Fragmented Student Inquiries:</strong> Prospective students were messaging across personal WhatsApp, Facebook Messenger, and phone calls without centralized qualification.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Slow Mobile Experience:</strong> Mobile users on 4G networks experienced heavy latency when browsing course descriptions and fee schedules.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Unmeasured Ad Spend:</strong> Paid campaigns lacked accurate server-side event tracking, making it impossible to calculate true cost per admitted student.
                </span>
              </li>
            </ul>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <h3 className="text-xl font-bold">The Strategic Objective</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Sadia&apos;s IELTS needed more than a digital brochure. They required a connected conversion engine: an authoritative web presence that communicated academic excellence, loaded instantly on mobile devices, and funneled student applicants straight into automated admission queues.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-card/60 p-4 font-mono text-xs text-primary">
              Objective: Sub-second load times + automated admissions routing + verified conversion tracking.
            </div>
          </SpotlightCard>
        </div>
      </Section>

      {/* The Solution */}
      <Section
        id="solution"
        eyebrow="ENGINEERED SOLUTION"
        title="Next.js App Router platform built for"
        titleAccent="sub-second mobile conversions."
        lede="ORBYT ONWARD designed and engineered a custom web architecture from the ground up, prioritizing mobile performance, clear course typography, and zero-friction lead capture."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Zap className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Sub-Second Rendering</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Built on Next.js with edge caching, asset preloading, and responsive image compression. The platform achieves a 0.38s Largest Contentful Paint (LCP) even on cellular connections.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Workflow className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Automated Lead Routing</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Inquiry forms immediately qualify students by target IELTS score and destination country, routing verified contact records directly to the admissions team without manual copy-paste.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Gauge className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Measurement Architecture</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Integrated conversion tracking captures every course view, syllabus download, and enrollment application, providing transparent attribution across organic and paid channels.
            </p>
          </SpotlightCard>
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
            {FEATURED_CASE_STUDY.components.map((comp) => (
              <div key={comp} className="flex items-center gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

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
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </Section>
    </SiteShell>
  );
}
