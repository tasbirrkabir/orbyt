/**
 * ORBYT — single source of truth for site copy.
 * Content is separated from presentation (src/components/orbyt/*).
 *
 * Rules enforced here:
 * - No invented clients, statistics, testimonials, awards or case studies.
 * - No empty phrases ("unlock your potential", "cutting-edge").
 * - Short sentences. Strong nouns. Strong verbs.
 */

export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Systems", href: "#systems" },
  { label: "Why ORBYT", href: "#why" },
  { label: "Insights", href: "#insights" },
] as const;

/* ── Hero ─────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "AI · WEB · AUTOMATION · GROWTH",
  titleA: "Build the system",
  titleB: "behind your growth.",
  sub: "ORBYT connects AI, web, marketing, tracking and automation into one working system — so growth stops leaking through the gaps.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "See how we work", href: "#process" },
  marquee: [
    "WEBSITE",
    "TRACKING",
    "MARKETING",
    "AUTOMATION",
    "CONVERSION",
    "OPERATIONS",
    "GROWTH",
  ],
} as const;

/* ── 01 · Problem ─────────────────────────────────────── */

export const PROBLEM = {
  eyebrow: "01 — THE PROBLEM",
  title: "Growth doesn't leak from one tool.",
  titleAccent: "It leaks between them.",
  lede: "Most businesses don't have a marketing problem or a tech problem. They have a connection problem.",
  items: [
    {
      fragment: "Website in one place.",
      detail:
        "Built by one vendor, changed by another. Nobody owns how it converts.",
    },
    {
      fragment: "Ads in another.",
      detail:
        "Campaigns spend, clicks arrive. What happens after the click is someone else's problem.",
    },
    {
      fragment: "Analytics broken.",
      detail:
        "Half the events fire, half don't. Decisions get made on guesses.",
    },
    {
      fragment: "Leads handled manually.",
      detail:
        "A form fills. Someone gets a notification. Sometimes someone follows up.",
    },
    {
      fragment: "AI disconnected.",
      detail:
        "A chatbot here, a prompt there. No workflow actually changed.",
    },
    {
      fragment: "Operations on repeat.",
      detail:
        "The same manual steps every week — growing with the business.",
    },
  ],
  position: "None of these are tool problems. They're system problems.",
  positionAccent: "ORBYT builds the layer that connects them.",
} as const;

/* ── 02 · Services / Capabilities ─────────────────────── */

export interface Service {
  index: string;
  id: string;
  title: string;
  what: string;
  why: string;
  builds: string[];
  connects: string;
  outcome: string;
}

export const SERVICES: Service[] = [
  {
    index: "01",
    id: "ai-automation",
    title: "AI & Automation",
    what: "Practical AI inside real workflows — agents, integrations and internal tools that remove repetitive work.",
    why: "Most teams don't have an AI problem. They have workflow problems that AI happens to solve.",
    builds: [
      "AI agents for support, ops and lead qualification",
      "Workflow automation across your existing tools",
      "Internal tools and intelligent dashboards",
      "AI integrations into the software you already run",
    ],
    connects: "CRM · website · lead flow · notifications · reporting",
    outcome: "Hours returned per week. Response times. Share of the workflow that runs itself.",
  },
  {
    index: "02",
    id: "web-digital",
    title: "Web & Digital Experiences",
    what: "Websites, landing pages and web applications built to convert — not just to exist.",
    why: "Your website is the one system every campaign, every lead and every customer passes through.",
    builds: [
      "Conversion-focused websites and landing page systems",
      "eCommerce and web applications",
      "Performance budgets — speed as a feature",
      "UX implementation that supports the next click",
    ],
    connects: "Tracking · ads · CRM · automation",
    outcome: "Conversion rate. Load time. Qualified leads — not raw traffic.",
  },
  {
    index: "03",
    id: "growth-marketing",
    title: "Growth & Marketing",
    what: "Acquisition built as infrastructure: campaigns wired to pages, data and follow-up.",
    why: "Ads rarely fail on their own. They fail when landing, tracking and follow-up aren't part of the same system.",
    builds: [
      "Performance campaigns — Meta and beyond",
      "Creative and campaign strategy",
      "Conversion optimization programs",
      "Campaign infrastructure: naming, feeds, structure",
    ],
    connects: "Landing pages · tracking stack · CRM · automation",
    outcome: "CAC. ROAS. Qualified pipeline — visible end to end.",
  },
  {
    index: "04",
    id: "data-tracking",
    title: "Data & Tracking",
    what: "Measurement you can act on — events, attribution and reporting that hold up under scrutiny.",
    why: "Without clean data, every other decision is a guess wearing a dashboard.",
    builds: [
      "GA4 and Google Tag Manager setup",
      "Meta Pixel and Conversions API",
      "Event architecture and attribution models",
      "Reporting dashboards people actually use",
    ],
    connects: "Website · ads · CRM · reporting",
    outcome: "Data quality. Decision speed. A CAC number you can trust.",
  },
  {
    index: "05",
    id: "digital-systems",
    title: "Digital Systems",
    what: "The connective layer: lead management, onboarding, notifications, reporting — the business running as one machine.",
    why: "This is where the other four meet. Without it, everything stays disconnected.",
    builds: [
      "Lead management and CRM workflows",
      "Client onboarding systems",
      "Notification and escalation flows",
      "Operational automation and reporting",
    ],
    connects: "Everything — this is the connection.",
    outcome: "Speed-to-lead. Cycle time. Manual steps removed.",
  },
];

/* The ORBYT chain — how the pieces actually connect */
export const CHAIN_NODES = [
  "AD CAMPAIGN",
  "LANDING PAGE",
  "EVENT TRACKING",
  "LEAD",
  "AUTOMATION",
  "CRM",
  "FOLLOW-UP",
  "CONVERSION",
] as const;

export const SERVICES_SECTION = {
  eyebrow: "02 — CAPABILITIES",
  title: "We don't sell services.",
  titleAccent: "We build the system they live in.",
  lede: "Five capability groups, one job: identify the bottleneck, design the system, build it, connect it, improve it.",
  chainCaption: "One system. Every step measured, every step connected.",
} as const;

/* ── 03 · Process ─────────────────────────────────────── */

export const PROCESS_STEPS = [
  {
    step: "01",
    name: "DISCOVER",
    what: "Map the system as it actually runs — tools, data, workflows, friction.",
    output: "System map and bottleneck list.",
  },
  {
    step: "02",
    name: "DESIGN",
    what: "Design the target system: what gets built, what gets connected, what gets measured.",
    output: "Blueprint and priorities.",
  },
  {
    step: "03",
    name: "BUILD",
    what: "Ship it — pages, integrations, agents, tracking. Working software, not decks.",
    output: "Live components.",
  },
  {
    step: "04",
    name: "CONNECT",
    what: "Wire everything together. Data flows both ways and tools stop being islands.",
    output: "Integrated pipeline.",
  },
  {
    step: "05",
    name: "MEASURE",
    what: "Instrument the system — events, dashboards, attribution from day one.",
    output: "Live measurement.",
  },
  {
    step: "06",
    name: "IMPROVE",
    what: "Review, remove friction, tighten conversion. The system compounds.",
    output: "Iteration loop.",
  },
] as const;

export const PROCESS_SECTION = {
  eyebrow: "03 — PROCESS",
  title: "How ORBYT works.",
  lede: "The same loop every time — because a system is never finished, only improving.",
} as const;

/* ── 04 · Systems (honest work section) ───────────────── */

export const SYSTEM_BLUEPRINTS = [
  {
    id: "acquisition",
    title: "The acquisition system",
    for: "For teams spending on ads with nothing wired behind them.",
    components: [
      "Landing page system",
      "GA4 + GTM event architecture",
      "Meta Pixel + Conversions API",
      "Lead routing and automated follow-up",
    ],
    measured: ["Conversion rate", "Cost per qualified lead", "Speed-to-lead"],
  },
  {
    id: "ai-ops",
    title: "The AI operations layer",
    for: "For teams losing their week to repetitive manual work.",
    components: [
      "Workflow audit and automation map",
      "AI agents with human escalation paths",
      "Integrations across existing tools",
      "Internal tool for the ops team",
    ],
    measured: ["Hours returned", "Response time", "Error rate"],
  },
  {
    id: "connected-web",
    title: "The connected website",
    for: "For teams whose website is a brochure, not infrastructure.",
    components: [
      "Rebuild with a conversion focus",
      "Full event tracking wired to the CRM",
      "Automation triggers on key actions",
      "Reporting the team reads weekly",
    ],
    measured: ["Conversion rate", "Lead quality", "Time-to-publish"],
  },
] as const;

export const SYSTEMS_SECTION = {
  eyebrow: "04 — SELECTED SYSTEMS",
  title: "What we build.",
  lede: "No invented case studies. No stockpiled logos. Client work gets published with permission — until then, here's the shape of the systems.",
  measuredLabel: "Measured",
} as const;

/* ── 05 · Why ORBYT (principles + about) ──────────────── */

export const PRINCIPLES = [
  {
    title: "Systems over disconnected tasks.",
    detail:
      "A website that doesn't talk to your CRM is a PDF with a URL. We own how the pieces fit.",
  },
  {
    title: "Strategy before execution.",
    detail:
      "We map the system before we build. Slower for a week. Faster forever.",
  },
  {
    title: "Measurement from day one.",
    detail:
      "If it isn't measured, it isn't shipped. Tracking is part of the build, not an afterthought.",
  },
  {
    title: "Automation where it matters.",
    detail:
      "We automate the steps that steal your team's week — not everything with a pulse.",
  },
  {
    title: "Design that supports conversion.",
    detail:
      "Sharp, fast, readable. Every screen answers one question: what should happen next?",
  },
  {
    title: "Technology that serves the business.",
    detail:
      "Boring, reliable tools over impressive ones. The outcome is the feature.",
  },
] as const;

export const WHY_SECTION = {
  eyebrow: "05 — WHY ORBYT",
  title: "A partner, not a vendor.",
  lede: "Six principles we don't negotiate on.",
  about:
    "ORBYT works at the intersection of technology, marketing and operations — the partner that owns how the pieces fit together, not another vendor holding a single piece.",
} as const;

/* ── 06 · Insights / Thinking ─────────────────────────── */

export const INSIGHTS = [
  {
    title: "Most “AI strategies” are workflow problems.",
    stance:
      "Before asking what AI can do, map what the business actually does. The bottleneck is usually a process, not a model.",
  },
  {
    title: "Your tracking is probably lying to you.",
    stance:
      "Duplicate events, missing Conversions API, attribution gaps. Most ad accounts optimize against bad data — confidently.",
  },
  {
    title: "A landing page is a system, not a page.",
    stance:
      "It inherits your ads, your tracking, your CRM, your follow-up. Treat it alone and it underperforms alone.",
  },
  {
    title: "Disconnected tools are a silent tax.",
    stance:
      "Nobody budgets the hours lost moving data between tools that should already be connected. It's the most expensive line item nobody sees.",
  },
] as const;

export const INSIGHTS_SECTION = {
  eyebrow: "06 — THINKING",
  title: "How we think.",
  lede: "Positions we argue from, not content for content's sake.",
} as const;

/* ── 07 · Contact ─────────────────────────────────────── */

export const CONTACT = {
  eyebrow: "07 — START A PROJECT",
  title: "Have a business problem worth solving?",
  sub: "Tell us what's slowing growth down. We'll tell you what we'd build, connect or measure first.",
  form: {
    nameLabel: "Name",
    namePlaceholder: "Who are we talking to?",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    messageLabel: "What's slowing growth down?",
    messagePlaceholder:
      "The more specific, the better. Tools, symptoms, what you've tried.",
    submit: "Start the conversation",
    submitting: "Sending…",
    success: "Received. You'll hear from us — a real reply, not an autoresponder.",
    error: "Something broke on our end. Try again, or email us directly.",
  },
  next: {
    title: "What happens next",
    steps: [
      "You describe the problem. Specifically beats politely.",
      "We reply with an honest read — including if we're not the right fit.",
      "If it makes sense: a short call, then a system map.",
    ],
  },
} as const;

export const CTA_STRIP = ["BUILD", "CONNECT", "GROW"] as const;

/* ── Footer ───────────────────────────────────────────── */

export const FOOTER = {
  philosophy: "Build better. Connect everything. Move forward.",
  onward: "Onward.",
  legal: "© 2025 ORBYT — Digital growth systems",
  tag: "BUILD · CONNECT · GROW",
} as const;
