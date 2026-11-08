export interface ServiceDetail {
  index: string;
  slug: string;
  title: string;
  category: string;
  heroHeadline: string;
  short: string;
  what: string;
  why: string;
  signs: string[];
  builds: string[];
  technologies: string[];
  deliverables: string[];
  useCases: Array<{ title: string; description: string }>;
  connects: string;
  outcome: string;
  faqs: Array<{ question: string; answer: string }>;
  image: string;
  imageCaption: string;
}

export const DETAILED_SERVICES: ServiceDetail[] = [
  {
    index: "01",
    slug: "custom-software-development",
    title: "Custom Software Development",
    category: "Software Engineering & Architecture",
    heroHeadline: "Purpose-built software engineered around your exact operational bottleneck.",
    short:
      "Enterprise web systems, custom backends, internal operations tools, and database architectures engineered to eliminate manual friction.",
    what: "We engineer software that fits your company's operational reality rather than forcing your business to fit around off-the-shelf constraints. From relational database modeling to modular API backends and role-based internal portals, every system is designed for durability, strict data integrity, and high operational throughput.",
    why: "Generic software forces compromise. When your competitive advantage lives in a proprietary process or specialized workflow, subscribing to five disconnected SaaS tools creates data silos and human copy-paste errors. Purpose-built software turns your process into scalable intellectual property.",
    signs: [
      "Your core business operations depend on fragile spreadsheets that only one person understands.",
      "Off-the-shelf SaaS tools lack the custom logic or integrations your workflow demands.",
      "Data must be manually copied across multiple disconnected software tools every day.",
      "You are hitting the scalability limits or prohibitive seat-pricing of third-party platforms.",
    ],
    builds: [
      "Full-stack custom web applications and business portals",
      "Scalable REST and GraphQL API backends",
      "PostgreSQL and relational database schemas with row-level security",
      "Enterprise workflow automation engines and internal tooling",
      "Role-based access control (RBAC) and multi-tenant security layers",
    ],
    technologies: [
      "TypeScript",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Prisma ORM",
      "Docker",
      "Tailwind CSS",
      "Redis",
      "REST & GraphQL",
    ],
    deliverables: [
      "Production-ready deployed software architecture",
      "Clean, documented TypeScript codebase with full source ownership",
      "Comprehensive database migration scripts and schema definitions",
      "Secure automated deployment pipelines (CI/CD)",
      "Technical handover and operational documentation",
    ],
    useCases: [
      {
        title: "Operations & Inventory Management",
        description:
          "Internal software for multi-branch inventory tracking, automated replenishment alerts, and staff task assignment.",
      },
      {
        title: "B2B Client Portals",
        description:
          "Secure branded portals where business clients upload deliverables, track milestone progress, view invoices, and communicate in real time.",
      },
      {
        title: "Custom Data Ingestion & Reporting",
        description:
          "High-throughput pipelines aggregating transaction data from multiple payment gateways into unified executive dashboards.",
      },
    ],
    connects: "Accounting · CRM · ERP · Payment Gateways · Communications",
    outcome:
      "100% elimination of manual data duplication. Direct operational control. Software that scales without per-seat licensing penalties.",
    faqs: [
      {
        question: "How long does a custom software development project typically take?",
        answer:
          "Most initial production deployments take between 4 to 10 weeks depending on architectural complexity. We ship incrementally in weekly working builds so your team tests and validates live software continuously rather than waiting for a single monolithic reveal.",
      },
      {
        question: "Do we own the full intellectual property and source code?",
        answer:
          "Yes. Upon completion and milestone delivery, you hold 100% full ownership of all source code, database architectures, assets, and deployment configurations without any proprietary vendor lock-in.",
      },
      {
        question: "How does ORBYT ONWARD handle software security and database integrity?",
        answer:
          "We follow zero-trust architectural principles: parameterized database queries preventing SQL injection, strict TypeScript typings, cryptographic password hashing (Argon2/bcrypt), multi-factor authentication (MFA/TOTP), and automated daily database snapshot backups.",
      },
    ],
    image: "/images/art/ops-assembly.png",
    imageCaption: "Modules moving through checkpoints, in order.",
  },
  {
    index: "02",
    slug: "web-development",
    title: "Web Development & Web Applications",
    category: "Web Engineering & Experience",
    heroHeadline: "Sub-second web platforms engineered for commercial conversion and technical durability.",
    short:
      "High-performance Next.js web applications, headless platforms, and marketing experiences built to convert traffic into verifiable revenue.",
    what: "We engineer web platforms that load in milliseconds, render semantic HTML for search engines, and guide prospective customers toward action. From interactive calculation engines and student enrollment portals to high-traffic digital publications, our web applications are engineered for zero-lag responsiveness across desktop and mobile devices.",
    why: "Your website is the single digital surface that every ad campaign, lead inquiry, and customer passes through. When a website is slow, confusing, or disconnected from your backend CRM, marketing spend is wasted before the prospect even sees your offer.",
    signs: [
      "Your current website takes longer than 2 seconds to load, especially on mobile networks in Bangladesh.",
      "High bounce rates and traffic that fails to convert into inquiries or transactions.",
      "The site requires complex developer intervention just to publish or update content.",
      "Analytics and event tracking break quietly during marketing campaigns.",
    ],
    builds: [
      "Sub-second Next.js web applications with server-side rendering (SSR) and static generation (SSG)",
      "High-converting landing page architectures with integrated analytics",
      "Dynamic interactive web portals (e.g. course catalogs, calculators, lead qualifiers)",
      "Headless CMS setups allowing marketing teams to update copy cleanly",
      "Core Web Vitals optimization achieving 95+ performance scores and sub-0.5s LCP",
    ],
    technologies: [
      "Next.js (App Router)",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "Edge Middleware",
      "Sharp & Next/Image",
      "Vercel / Node Server",
    ],
    deliverables: [
      "Blazing-fast responsive web platform audited for 95+ Core Web Vitals",
      "End-to-end event tracking wired to Google Tag Manager and Conversions API",
      "Accessible, mobile-optimized UI system built with custom brand tokens",
      "Automated lead capture routing directly into email and messaging channels",
    ],
    useCases: [
      {
        title: "EdTech Academy Admissions Portal",
        description:
          "Live case: Sadia's IELTS Academy — 0.38s LCP, streamlined preparation catalogs, and automated WhatsApp inquiry routing producing a 44% lift in admissions velocity.",
      },
      {
        title: "High-Traffic Corporate Platforms",
        description:
          "Enterprise company websites with search-engine-optimized editorial layouts, dynamic case study indexes, and real-time lead qualification.",
      },
      {
        title: "Interactive Product Configuration Tools",
        description:
          "Web apps calculating pricing, quotes, or service tiers in real time, converting cold visitors into pre-qualified sales calls.",
      },
    ],
    connects: "Analytics · Meta Pixel · CRM · WhatsApp Business API · Payment Processing",
    outcome:
      "Sub-0.5s Largest Contentful Paint. Search engine indexability. Measurably higher conversion rates per thousand visitors.",
    faqs: [
      {
        question: "Why does ORBYT ONWARD build with Next.js instead of WordPress?",
        answer:
          "WordPress sites suffer from plugin bloat, sluggish database queries, security vulnerabilities, and brittle updates. Next.js delivers pre-rendered static HTML with instant edge caching, institutional security, sub-second loading, and full code flexibility.",
      },
      {
        question: "How do you guarantee Core Web Vitals and speed on mobile connections?",
        answer:
          "We eliminate render-blocking JavaScript, enforce strict image optimization (WebP/AVIF with exact responsive srcsets), utilize native CSS font-display swaps, and stream HTML from edge CDNs so the browser renders content immediately.",
      },
    ],
    image: "/images/art/design-grid.png",
    imageCaption: "Surfaces drawn on the same grid, then shipped.",
  },
  {
    index: "03",
    slug: "saas-development",
    title: "SaaS Development",
    category: "Cloud Product Engineering",
    heroHeadline: "Multi-tenant cloud architectures engineered from database schema to automated subscription billing.",
    short:
      "Scalable software-as-a-service (SaaS) products built with multi-tenant data isolation, user authentication, usage metering, and payment gateways.",
    what: "We take software concepts from architectural design to recurring-revenue cloud platforms. Our engineering covers the entire SaaS lifecycle: tenant workspace provisioning, role-based permissions, automated Stripe/SSLCommerz subscription billing, webhooks, transactional email notifications, and administrative telemetry.",
    why: "Building a SaaS product is not merely building a web app; it requires handling tenant security, self-service onboarding, payment webhooks, and zero-downtime database migrations. Getting the foundation right on day one prevents catastrophic rewrites when your user base grows.",
    signs: [
      "You have validated a software business model and need an engineering team to build the MVP.",
      "An existing single-tenant application needs to be architected for scalable multi-tenant SaaS.",
      "Subscription billing, seat management, or usage metering is consuming weeks of developer time.",
      "Security or data isolation between business clients is a compliance concern.",
    ],
    builds: [
      "Multi-tenant database architectures with schema or row-level tenant isolation",
      "Complete user authentication, session security, passwordless login, and MFA/TOTP",
      "Subscription billing engines with automated tier upgrades, prorations, and invoice generation",
      "Self-service tenant onboarding and automated workspace provisioning",
      "Super-admin consoles with customer telemetry, MRR tracking, and user management",
    ],
    technologies: [
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "Prisma",
      "Supabase",
      "Stripe / LemonSqueezy / Local Gateways",
      "Resend / Postmark",
      "Upstash Redis",
      "Docker",
    ],
    deliverables: [
      "Full multi-tenant production SaaS codebase",
      "Automated subscription billing integration with webhook handling",
      "Client administrative dashboard and super-admin telemetry console",
      "Automated CI/CD deployment pipeline with staging and production environments",
    ],
    useCases: [
      {
        title: "B2B Workflow SaaS",
        description:
          "Multi-tenant cloud tools enabling companies to manage client projects, invoice customers, and collaborate in real-time workspaces.",
      },
      {
        title: "Vertical SaaS for Industry Niches",
        description:
          "Purpose-built software platforms serving specialized sectors (e.g. tuition academies, clinical intake, logistics dispatching) with custom subscription tiers.",
      },
    ],
    connects: "Billing Gateways · Email Deliverability · Redis Queue · Database · Customer Support",
    outcome:
      "Rapid time-to-market. Zero-downtime scalability. Architectural foundation ready for institutional investor scrutiny.",
    faqs: [
      {
        question: "Can we integrate both international and local Bangladeshi payment gateways?",
        answer:
          "Yes. We architect payment adapters supporting Stripe, Paddle, or LemonSqueezy for international currency billing alongside local gateway integrations (bKash, Nagad, SSLCommerz) where required.",
      },
      {
        question: "How do you guarantee tenant data isolation?",
        answer:
          "We implement database-level row-level security (RLS) and cryptographic tenant scoping on every query, ensuring no organization can ever view or mutate another tenant's data.",
      },
    ],
    image: "/images/art/layered-system.png",
    imageCaption: "Multi-tenant cloud layers built for horizontal scale.",
  },
  {
    index: "04",
    slug: "ai-automation",
    title: "AI Development & Workflow Automation",
    category: "Artificial Intelligence & Automation",
    heroHeadline: "Practical AI agents and autonomous workflows placed where they genuinely return hours.",
    short:
      "Intelligent agents, LLM integrations, document extraction pipelines, and automated background jobs that run business operations without manual intervention.",
    what: "We engineer AI systems that solve real operational bottlenecks rather than building novelty chatbots. We connect large language models (LLMs), optical character recognition (OCR), and autonomous webhook workers directly to your CRM, databases, and communication channels. Tasks that previously ate twenty staff hours a week run automatically with strict human escalation paths.",
    why: "Adopting AI without a workflow map gives you a faster version of a broken process. Real productivity gains come when AI is placed inside an integrated pipeline with structured validation, clean error handling, and direct operational feedback.",
    signs: [
      "Customer inquiries sit unanswered for hours because staff are occupied with repetitive questions.",
      "Team members spend hours transcribing data from PDFs, emails, or messages into software.",
      "Lead qualification depends entirely on manual inspection.",
      "You have experimented with standalone AI tools but failed to integrate them into daily operations.",
    ],
    builds: [
      "Autonomous AI customer support and lead qualification agents with guardrails",
      "Document processing pipelines extracting structured data from invoices and forms",
      "Autonomous multi-step n8n / custom worker automations connecting APIs",
      "Internal knowledge base search engines (RAG) querying proprietary company documentation",
      "Automated escalation triggers routing edge cases to human operators with full context",
    ],
    technologies: [
      "OpenAI API",
      "Anthropic Claude API",
      "LangChain / LlamaIndex",
      "Vector Databases (pgvector / Pinecone)",
      "n8n / Node.js Workers",
      "WhatsApp Cloud API",
      "Webhooks & Queue Workers",
    ],
    deliverables: [
      "Production-deployed AI agents with deterministic system prompts and error boundaries",
      "Automated background processing workers with real-time alerting",
      "Operational control panel to monitor agent conversations, latency, and token costs",
      "Human-in-the-loop escalation workflows",
    ],
    useCases: [
      {
        title: "Instant 60-Second Inbound Lead Response",
        description:
          "AI agents that engage incoming WhatsApp and website inquiries within seconds, answer detailed curriculum or service questions, qualify the budget, and schedule discovery calls directly onto calendars.",
      },
      {
        title: "Intelligent Document Routing",
        description:
          "Automated ingestion of incoming student visa applications or business invoices, extracting identity fields, validating attachments, and creating database records without human data entry.",
      },
    ],
    connects: "WhatsApp · CRM · Email · Databases · Slack / Internal Messaging · Calendar",
    outcome:
      "Sub-minute response times to every prospect. 15–25 hours saved per operator each week. Zero dropped leads.",
    faqs: [
      {
        question: "How do you prevent AI agents from hallucinating or sharing incorrect data?",
        answer:
          "We utilize strict retrieval-augmented generation (RAG) architectures with grounded knowledge boundaries. The agent is explicitly restricted to verified company reference documentation and programmed with deterministic fallback instructions to escalate to a human when confidence falls below threshold.",
      },
      {
        question: "Can the AI agent communicate in Bengali and English?",
        answer:
          "Yes. Our agents are natively configured to detect and converse seamlessly in English, Bengali, or colloquial Banglish, matching the natural language preferences of Bangladeshi consumers.",
      },
    ],
    image: "/images/art/ai-synapse.png",
    imageCaption: "A network that watches back and routes intelligence.",
  },
  {
    index: "05",
    slug: "performance-marketing",
    title: "Performance Marketing & Media Buying",
    category: "Growth & Tracking Infrastructure",
    heroHeadline: "Paid acquisition engineered as infrastructure: campaigns wired directly to pages, data, and revenue.",
    short:
      "Data-backed Meta and Google advertising campaigns connected to high-converting landing pages, server-side tracking, and automated follow-up.",
    what: "We run paid acquisition as an engineering discipline rather than an artistic gamble. We don't just 'run ads'; we architect the entire path from ad creative and audience targeting to custom-built landing pages, Meta Conversions API (CAPI), Google Analytics 4, and automated sales follow-up. Every dollar spent is tied directly to pipeline value.",
    why: "Advertising campaigns rarely fail because of the ad alone; they fail because the landing page is slow, tracking is broken, and leads are ignored for hours. When acquisition is built as one connected system, ad spend compounds into predictable pipeline.",
    signs: [
      "Ad spend is increasing every month, but sales and qualified leads remain stagnant.",
      "Discrepancies between ad platform reported leads and actual sales figures in your CRM.",
      "Campaigns direct traffic to generic homepages instead of dedicated conversion landing pages.",
      "Cost per acquisition (CPA) is volatile and untraceable.",
    ],
    builds: [
      "Full-funnel Meta Ads (Facebook & Instagram) and Google Search campaign structures",
      "High-converting dedicated campaign landing pages with sub-second mobile speeds",
      "Server-side tracking setups: Meta Conversions API (CAPI) and Google Tag Manager (GTM)",
      "Automated lead delivery pipelines alerting your sales team on WhatsApp within seconds",
      "Attribution dashboards displaying real cost per qualified lead (CPQL) and ROAS",
    ],
    technologies: [
      "Meta Ads Manager",
      "Google Ads",
      "Meta Conversions API (Server-Side)",
      "Google Tag Manager & GA4",
      "Stripe / CRM Event Webhooks",
      "Real-time Analytics Dashboards",
    ],
    deliverables: [
      "Tested campaign architecture with scalable audience and creative segmentation",
      "Verified server-side event tracking with 9.0+ Meta Event Quality Match scores",
      "Custom high-speed conversion landing pages matching campaign messaging",
      "Weekly transparent reporting on actual customer acquisition costs and pipeline velocity",
    ],
    useCases: [
      {
        title: "High-Ticket EdTech Student Recruitment",
        description:
          "Meta advertising funnels for IELTS preparation and study-abroad intake, driving qualified candidate volume with verified tracking from impression to completed admission.",
      },
      {
        title: "B2B Software & Professional Services Pipeline",
        description:
          "Intent-driven Google Search campaigns capturing active buyers searching for software development and automation services in Bangladesh.",
      },
    ],
    connects: "Ad Platforms · Landing Pages · Conversions API · WhatsApp · CRM",
    outcome:
      "Predictable Customer Acquisition Cost (CAC). 100% verified event tracking data. Higher return on ad spend.",
    faqs: [
      {
        question: "Why is server-side tracking (Conversions API) necessary?",
        answer:
          "Modern browser privacy features, iOS updates, and ad blockers block 25% to 40% of traditional browser pixel events. Server-side tracking sends conversion events directly from the server to Meta and Google, restoring attribution accuracy and allowing machine-learning algorithms to optimize for actual purchasers.",
      },
      {
        question: "What is your approach to creative testing?",
        answer:
          "We test multiple creative angles, hooks, and formats systematically, measuring click-through rate, cost per lead, and downstream sales qualification to rapidly scale top-performing creative assets.",
      },
    ],
    image: "/images/art/growth-beam.png",
    imageCaption: "One capture point, every channel fanning out.",
  },
  {
    index: "06",
    slug: "video-editing",
    title: "Video Editing & Creative Production",
    category: "Creative Systems & Production",
    heroHeadline: "High-retention video creative engineered to stop the scroll and drive commercial conversion.",
    short:
      "Direct-response video editing, social ad creative systems, product motion graphics, and editorial video assets built for commercial performance.",
    what: "We produce video creative designed specifically for commercial attention. Working in synergy with our software and performance marketing capabilities, our creative production focuses on hook rate, average watch time, narrative pacing, clear value demonstration, and decisive calls-to-action that turn viewers into inbound leads.",
    why: "Creative is the primary targeting lever in modern digital advertising. Even the most sophisticated tracking and software pipeline falls flat if the initial visual creative fails to capture attention within the first three seconds.",
    signs: [
      "Your video ads suffer from steep drop-offs in the first 3 seconds.",
      "Creative fatigue causes campaign performance to degrade after two weeks.",
      "Product demonstrations look amateurish or fail to communicate technical complexity clearly.",
      "Lack of modular creative variations to test different audience angles.",
    ],
    builds: [
      "High-converting direct-response video ads for Meta, TikTok, and YouTube",
      "Software product walkthroughs and interactive feature motion graphics",
      "Hook-rate optimization: testing 3–5 distinct visual and auditory opening hooks per concept",
      "Dynamic typography, kinetic captioning, sound design, and color grading",
      "Multi-aspect ratio formatting (9:16 vertical, 1:1 square, 16:9 widescreen)",
    ],
    technologies: [
      "Adobe Premiere Pro",
      "Adobe After Effects",
      "DaVinci Resolve",
      "Motion Graphics & Dynamic Type",
      "Audio Mastering & Sound Design",
      "High-Bitrate Lossless Encoding",
    ],
    deliverables: [
      "Platform-ready 4K and 1080p video masters in vertical and horizontal orientations",
      "Batch-tested creative variations with alternate hooks, pacing, and CTAs",
      "Clean project files, caption subtitle tracks (.srt), and audio stems",
      "Iterative performance revisions based on real advertising retention analytics",
    ],
    useCases: [
      {
        title: "EdTech & Academy Student Testimonial Edits",
        description:
          "Dynamic, fast-paced student success stories combining classroom footage, test scores, kinetic motion typography, and urgent batch-enrollment calls-to-action.",
      },
      {
        title: "SaaS Product Showcase & Demo Videos",
        description:
          "Clean screen recordings enhanced with smooth cursor animations, feature zoom callouts, and rhythmic sound design communicating product value in under 45 seconds.",
      },
    ],
    connects: "Ad Campaigns · Social Channels · Landing Pages · Product Onboarding",
    outcome:
      "Above-average 3-second hook rates. Measurably lower cost-per-click. High-trust brand perception.",
    faqs: [
      {
        question: "How do you determine the style of video to produce?",
        answer:
          "We analyze your target audience, customer pain points, and distribution channel. B2B software requires crisp product walkthroughs, while consumer education demands authentic, high-energy storytelling with kinetic captions.",
      },
      {
        question: "Do you provide raw footage filming or remote post-production editing?",
        answer:
          "We specialize in comprehensive post-production editing, motion graphics, audio mastering, and creative direction. Clients can provide raw video assets or screen recordings, which we transform into polished commercial creatives.",
      },
    ],
    image: "/images/art/circuit-weave.png",
    imageCaption: "Creative assets woven into the performance pipeline.",
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return DETAILED_SERVICES.find((s) => s.slug === slug);
}

