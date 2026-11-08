import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteShell } from "@/components/orbyt/site-shell";
import { PageHero } from "@/components/orbyt/page-hero";
import { Section } from "@/components/orbyt/section";
import { Reveal } from "@/components/orbyt/reveal";
import { SpotlightCard } from "@/components/orbyt/spotlight-card";
import { Button } from "@/components/ui/button";
import { BreadcrumbsJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { SITE, CONTACT } from "@/content/orbyt";

export const metadata: Metadata = {
  title: "ORBYT ONWARD | Software Development Company in Bangladesh",
  description:
    "ORBYT ONWARD is a Bangladesh-based software development and digital systems company engineering custom software, web applications, SaaS platforms, and AI automation systems.",
  alternates: {
    canonical: "/software-development-company-bangladesh",
  },
  openGraph: {
    title: "ORBYT ONWARD | Software Development Company in Bangladesh",
    description:
      "Bangladesh-based software engineering and digital systems company. We build custom software, web apps, SaaS platforms, and AI automation systems that connect directly to business growth.",
    url: "https://orbytonward.tech/software-development-company-bangladesh",
    siteName: "ORBYT ONWARD",
    type: "website",
    images: [
      {
        url: "https://orbytonward.tech/images/art/sadias-ielts-showcase.png",
        width: 1200,
        height: 630,
        alt: "ORBYT ONWARD — Software Development Company in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORBYT ONWARD | Software Development Company in Bangladesh",
    description:
      "Bangladesh-based software engineering and digital systems company. Custom software, web apps, SaaS platforms, and AI automation.",
    images: ["https://orbytonward.tech/images/art/sadias-ielts-showcase.png"],
  },
};

const FAQS = [
  {
    question: "Why choose a software development company in Bangladesh like ORBYT ONWARD?",
    answer:
      "ORBYT ONWARD offers world-class modern software engineering combined with strategic business systems thinking. Based in Bangladesh, our team delivers high-velocity, rigorous engineering using modern technology stacks (TypeScript, Next.js, Node.js, PostgreSQL) without the bloated agency overhead. We treat code as a durable business asset and measure technical success by real operational outcomes.",
  },
  {
    question: "What types of custom software does ORBYT ONWARD build?",
    answer:
      "We design and build bespoke business portals, internal management dashboards, high-performance web applications, multi-tenant SaaS platforms, workflow automation engines, and custom API backends tailored to proprietary operations.",
  },
  {
    question: "How does ORBYT ONWARD approach software architecture and code quality?",
    answer:
      "We adhere to strict engineering standards: TypeScript across the entire surface, modular relational data modeling with PostgreSQL, clean component separation, comprehensive linting, automated CI/CD deployment pipelines, and zero-compromise Core Web Vitals performance.",
  },
  {
    question: "Can ORBYT ONWARD integrate AI and workflow automation into our existing operations?",
    answer:
      "Yes. We engineer practical, production-ready AI solutions — including automated document processing, conversational lead routing, customer qualification bots, and webhook-driven synchronizations between databases, CRMs, and ad channels.",
  },
  {
    question: "How do you handle client communication and project milestones?",
    answer:
      "We work in transparent, weekly development cycles. Every client receives direct access to live staging environments, weekly architecture walk-throughs, clear version control milestones, and asynchronous updates without endless, unproductive meetings.",
  },
  {
    question: "What is your typical project kickoff process?",
    answer:
      "Every engagement starts with a technical discovery and systems mapping session. We map your current bottlenecks, draft a comprehensive technical architecture specification, agree on measurable project milestones, and immediately begin iterative sprint execution.",
  },
];

const CAPABILITIES = [
  {
    icon: Code2,
    title: "Custom Software Development",
    href: "/services/custom-software-development",
    description:
      "Tailor-made software architectures engineered around your exact company processes. We build secure internal tools, operations dashboards, inventory systems, and proprietary workflow software that eliminate manual human friction.",
    deliverables: ["Custom Business Portals", "REST & GraphQL APIs", "Database Schemas", "Role-based Access Controls"],
  },
  {
    icon: Layers,
    title: "Web Application Engineering",
    href: "/services/web-development",
    description:
      "High-speed, production-grade web applications built with Next.js and TypeScript. We obsess over sub-second response times, rock-solid accessibility, responsive layouts, and conversion-engineered user interfaces.",
    deliverables: ["Next.js App Router Web Apps", "Server-Side & Static Rendering", "Interactive Portals", "Lighthouse 95+ Performance"],
  },
  {
    icon: Rocket,
    title: "SaaS Product Development",
    href: "/services/saas-development",
    description:
      "Full-lifecycle software-as-a-service development from Day 0 architecture to scalable production. We implement multi-tenant databases, Stripe/Paddle billing pipelines, user authentication, and usage analytics.",
    deliverables: ["Multi-Tenant Architecture", "Subscription Billing Integration", "Self-Service Onboarding", "Usage Tracking & Limits"],
  },
  {
    icon: BrainCircuit,
    title: "AI & Workflow Automation",
    href: "/services/ai-automation",
    description:
      "Autonomous systems and AI workflows that connect your disjointed apps. We deploy LLM pipelines, autonomous lead qualifiers, database synchronization webhooks, and automated administrative operations.",
    deliverables: ["LLM API Pipeline Integration", "CRM & Webhook Automation", "Data Pipeline ETL", "AI Assistants & Routing"],
  },
];

const TECH_STACK = [
  { category: "Frontend", items: ["TypeScript", "Next.js 15", "React 19", "Tailwind CSS", "Framer Motion"] },
  { category: "Backend & APIs", items: ["Node.js", "Next.js Route Handlers", "REST Architecture", "GraphQL", "Webhook Systems"] },
  { category: "Data & Storage", items: ["PostgreSQL", "Supabase", "Prisma ORM", "Redis Caching", "Vector Stores"] },
  { category: "Infrastructure", items: ["Vercel Edge", "Cloudflare DNS & CDN", "Docker", "GitHub Actions CI/CD"] },
];

export default function SoftwareDevelopmentCompanyBangladeshPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    {
      name: "Software Development Company Bangladesh",
      url: "/software-development-company-bangladesh",
    },
  ];

  return (
    <SiteShell>
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <FaqJsonLd faqs={FAQS} />

      {/* Hero */}
      <PageHero
        id="software-dev-bd"
        eyebrow="SOFTWARE DEVELOPMENT COMPANY IN BANGLADESH // ORBYT ONWARD"
        title="We build the connected software systems that power business scale."
        lede="ORBYT ONWARD is an engineering-first software development and digital systems company based in Bangladesh. We combine full-stack software development, AI automation, and performance measurement into unified business systems."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild className="h-12 px-7 text-base font-semibold">
            <Link href={SITE.cta.href}>
              {SITE.cta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-7 text-base font-semibold">
            <Link href="#capabilities">Explore Capabilities</Link>
          </Button>
        </div>
      </PageHero>

      {/* Overview Section */}
      <Section
        id="overview"
        eyebrow="ENGINEERING PHILOSOPHY"
        title="Technology built to serve the business,"
        titleAccent="not software for its own sake."
        lede="Most companies do not suffer from a shortage of software tools. They suffer from disconnected tools. Marketing runs in one platform, customer records sit in another, operations are trapped in spreadsheets, and developers build features without measuring business impact. ORBYT ONWARD bridges that gap."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <GitBranch className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Strategy Before Execution</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We never start writing code until we understand your operational reality, unit economics, and data models. Every database table and API route maps to an actual business objective.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Network className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Connected Digital Systems</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Software is only as valuable as the pipelines connected to it. We wire customer touchpoints, ad channels, automated workflows, and CRM databases into a unified, leak-free pipeline.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-7">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Zap className="size-5" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Measurement From Day One</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every system we deploy includes server-side event tracking, error logging, and performance telemetry. You always know what is converting, what is failing, and where velocity is generated.
            </p>
          </SpotlightCard>
        </div>
      </Section>

      {/* Capabilities Grid */}
      <Section
        id="capabilities"
        eyebrow="OUR CORE CAPABILITIES"
        title="Software development services engineered"
        titleAccent="for durability and operational speed."
        lede="Whether you need an internal operations portal to replace manual chaos, a multi-tenant SaaS platform, or AI-driven automation pipelines, we engineer robust, scalable software."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <SpotlightCard key={cap.title} className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <Link
                    href={cap.href}
                    className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                  >
                    View Service <ArrowRight className="size-3" />
                  </Link>
                </div>
                <h3 className="mt-6 text-2xl font-bold">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Key Deliverables:</p>
                  <ul className="mt-2 space-y-1.5">
                    {cap.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-xs text-foreground/90">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </Section>

      {/* Featured Real Case Studies */}
      <Section
        id="case-study"
        eyebrow="PROVEN WORK IN BANGLADESH"
        title="Verified Client Deployments:"
        titleAccent="High-Impact Digital Systems in Production."
        lede="Real systems engineered by ORBYT ONWARD for growing enterprises in Bangladesh — combining sub-second performance, automated workflows, and conversion architecture."
      >
        {/* Case Study 1: Sadia's IELTS */}
        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-card/40">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="p-8 sm:p-10 lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                Live Production Case Study // 01
              </span>
              <h3 className="mt-4 text-3xl font-bold">
                Sadia&apos;s IELTS Digital Growth Platform
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sadia&apos;s IELTS was experiencing rapid growth but faced friction from slow student signups, unmeasured social traffic, and manual student tracking. ORBYT ONWARD designed, developed, and deployed a custom Next.js web application with integrated analytics and automated lead routing.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 border-y border-border py-4">
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">0.38s</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Largest Contentful Paint</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">+44%</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Admission Conversions</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">100%</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Automated Pipeline</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button asChild className="h-10 px-5 text-sm font-semibold">
                  <Link href="/work/sadias-ielts">
                    Read Complete Case Study
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
                <a
                  href="https://sadiasielts.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Visit Live Website <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="relative min-h-[300px] border-t border-border lg:border-l lg:border-t-0 lg:col-span-5 bg-black/40">
              <Image
                src="/images/art/sadias-ielts-showcase.png"
                alt="Sadia's IELTS Academy Showcase designed and developed by ORBYT ONWARD"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>

        {/* Case Study 2: Your Tech Eye */}
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card/40">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="p-8 sm:p-10 lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                Live Production Case Study // 02
              </span>
              <h3 className="mt-4 text-3xl font-bold">
                Your Tech Eye Security & Live Operations Platform
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your Tech Eye provides 24/7 proactive remote video surveillance with trained operators intervening live. ORBYT ONWARD designed and developed a tactical web platform, interactive security architecture catalog, and direct emergency consultation funnels.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 border-y border-border py-4">
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">100%</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Proactive Ops Focus</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">Sub-0.4s</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Edge Rendering</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-primary">24/7</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Dhaka Operations</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button asChild className="h-10 px-5 text-sm font-semibold">
                  <Link href="/work/your-tech-eye">
                    Read Complete Case Study
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
                <a
                  href="https://yourtecheye.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  Visit Live Website <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="relative min-h-[300px] border-t border-border lg:border-l lg:border-t-0 lg:col-span-5 bg-black/40">
              <Image
                src="/images/art/your-tech-eye-showcase.jpg"
                alt="Your Tech Eye Live Monitoring Platform designed and developed by ORBYT ONWARD"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Technology Stack */}
      <Section
        id="tech-stack"
        eyebrow="ENGINEERED WITH MODERN TOOLS"
        title="Modern, battle-tested technology stack,"
        titleAccent="free from legacy bloat."
        lede="We do not build with deprecated CMS systems or fragile page builders. Every line of code is typed, modular, and optimized for high-throughput production deployment."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map((group) => (
            <SpotlightCard key={group.category} className="p-6">
              <h4 className="font-mono text-xs uppercase tracking-wider text-primary">
                {group.category}
              </h4>
              <ul className="mt-4 space-y-2">
                {group.items.map((tech) => (
                  <li key={tech} className="flex items-center gap-2 text-sm text-foreground/90">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          ))}
        </div>
      </Section>

      {/* Team & Leadership */}
      <Section
        id="leadership"
        eyebrow="LEADERSHIP & ENGINEERING"
        title="Direct access to systems architects,"
        titleAccent="not account managers."
        lede="When you partner with ORBYT ONWARD, you collaborate directly with senior engineers and systems designers who understand software architecture and business economics."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SpotlightCard className="p-8">
            <span className="font-mono text-xs uppercase tracking-wider text-primary">
              Founder & Lead Systems Architect
            </span>
            <h3 className="mt-2 text-2xl font-bold">Tasbir Kabir</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tasbir leads software architecture, systems engineering, and technology strategy at ORBYT ONWARD. With deep background in full-stack web engineering, Next.js, API design, and automated data pipelines, he ensures that every client system is architected for long-term scalability and business impact.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>Location: Dhaka, Bangladesh</span>
              <span>·</span>
              <a
                href="https://github.com/tasbirrkabir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Profile
              </a>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-8">
            <span className="font-mono text-xs uppercase tracking-wider text-primary">
              Engineering Delivery Model
            </span>
            <h3 className="mt-2 text-2xl font-bold">High-Velocity Bangladesh Engineering</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Based in Bangladesh, we assemble specialized teams around software development, AI automation, and conversion systems. Our lean operational model gives forward-thinking companies enterprise-grade software engineering without bloated management layers.
            </p>
            <div className="mt-6 border-t border-border pt-4">
              <Link href="/team" className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline">
                Explore our full engineering team <ArrowRight className="size-3" />
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </Section>

      {/* FAQs */}
      <Section
        id="faqs"
        eyebrow="COMMONLY ASKED QUESTIONS"
        title="Frequently asked questions about working"
        titleAccent="with ORBYT ONWARD in Bangladesh."
        lede="Clear, direct answers about our capabilities, technical processes, and partnership terms."
      >
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FAQS.map((faq) => (
            <SpotlightCard key={faq.question} className="p-6">
              <h4 className="text-base font-bold text-foreground">{faq.question}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </SpotlightCard>
          ))}
        </div>
      </Section>

      {/* Final Commercial CTA */}
      <Section
        id="contact-cta"
        eyebrow="READY TO BUILD?"
        title="Let's engineer a connected system"
        titleAccent="for your business growth."
        lede="Schedule a free technical architecture consultation. We will analyze your current software bottlenecks and deliver a concrete implementation roadmap."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
            <Link href={SITE.cta.href}>
              {SITE.cta.label}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold">
            <Link href="/work">Review Case Studies</Link>
          </Button>
        </div>
      </Section>
    </SiteShell>
  );
}
