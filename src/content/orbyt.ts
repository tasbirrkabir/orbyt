/**
 * ORBYT site copy. Voice rules:
 * - Talk to one reader ("you"). Name what they actually feel.
 * - Concrete over abstract. Specific beats impressive.
 * - Short sentences, varied rhythm, zero hype, zero em-dashes.
 * - Nothing invented: no clients, no numbers, no testimonials,
 *   no fake headshots. The crew is presented as roles, honestly.
 */

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Insights", href: "/insights" },
] as const;

export const SITE = {
  wordmark: "ORBYT",
  tagline: "Digital systems built for growth",
  cta: { label: "Start a project", href: "/contact" },
  secondaryCta: { label: "See how we work", href: "/process" },
} as const;

/* ── Home ─────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "AI · WEB · AUTOMATION · GROWTH",
  titleA: "Build the system",
  titleB: "behind your growth.",
  sub: "Your website, your ads, your data, your tools. They should pull in the same direction. ORBYT wires them into one system, so growth stops leaking through the gaps.",
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

export const HOME_TRUST = {
  // The one honest promise we can make before any project starts.
  items: [
    { k: "STRATEGY FIRST", v: "Nothing gets built before the system is mapped." },
    { k: "MEASURED", v: "Tracking ships with the work, not after it." },
    { k: "CONNECTED", v: "Everything we build talks to what you already run." },
  ],
} as const;

export const PROBLEM = {
  eyebrow: "THE PROBLEM",
  title: "Growth doesn't leak from one tool.",
  titleAccent: "It leaks between them.",
  lede: "You've probably felt it. Things work, individually. Together, they don't. And nobody owns the space in between.",
  items: [
    {
      fragment: "Website in one place.",
      detail:
        "Built by one person, patched by another. Months later, nobody can say why it converts the way it does.",
    },
    {
      fragment: "Ads in another.",
      detail:
        "Budget goes out, clicks come in. What happens after the click is someone else's job, which means it's nobody's job.",
    },
    {
      fragment: "Analytics you can't trust.",
      detail:
        "Some events fire, some don't. Reports look healthy, gut says otherwise. Decisions drift toward guesses.",
    },
    {
      fragment: "Leads handled by memory.",
      detail:
        "A form comes in, a notification pings, a busy person means to reply. The ones that slip away never tell you.",
    },
    {
      fragment: "AI bought, not placed.",
      detail:
        "A chatbot here, a subscription there. Everyone's talking about AI. Few workflows actually changed.",
    },
    {
      fragment: "The same Tuesday, every week.",
      detail:
        "Copy-paste, re-export, update the sheet. The work grows with the business, and so does the busywork.",
    },
  ],
  position: "None of these are tool problems. They're connection problems.",
  positionAccent: "ORBYT builds the layer that connects them.",
} as const;

/* ── Services ─────────────────────────────────────────── */

export interface Service {
  index: string;
  slug: string;
  title: string;
  short: string;
  what: string;
  why: string;
  signs: string[];
  builds: string[];
  connects: string;
  outcome: string;
}

export const SERVICES: Service[] = [
  {
    index: "01",
    slug: "ai-automation",
    title: "AI & Automation",
    short:
      "Practical AI inside real workflows. Agents, integrations and internal tools that take repetitive work off your team's plate.",
    what: "We find the work your team does twice, automate it carefully, and place AI where it genuinely helps. Support replies, lead qualification, reporting, handoffs. If a workflow doesn't need AI, we say so.",
    why: "Because the goal was never 'use AI'. The goal is a team that spends its week on work that matters.",
    signs: [
      "Your team drowns in small repeated tasks",
      "Replies to leads depend on who's free",
      "Someone maintains a spreadsheet that runs the business",
      "You've bought AI tools nobody opened twice",
    ],
    builds: [
      "AI agents for support, ops and lead qualification",
      "Workflow automation across the tools you already use",
      "Internal tools and dashboards for your ops team",
      "AI integrations into existing software",
    ],
    connects: "CRM · website · lead flow · notifications · reporting",
    outcome: "Hours returned per week. Faster response times. The share of the workflow that runs without anyone touching it.",
  },
  {
    index: "02",
    slug: "web-digital",
    title: "Web & Digital Experiences",
    short:
      "Websites, landing pages and web applications built to convert, not just to exist.",
    what: "We build the pages your business runs on: fast, clear, and wired to everything behind them. Every screen answers one question for the visitor: what should I do next?",
    why: "Your website is the one system every campaign, every lead and every customer passes through. It deserves more care than a brochure.",
    signs: [
      "Traffic is fine, sign-ups aren't",
      "The site takes longer to change than to complain about",
      "You can't tell which pages earn their keep",
      "Mobile feels like an afterthought",
    ],
    builds: [
      "Conversion-focused websites and landing page systems",
      "eCommerce and web applications",
      "Performance work, because speed is a feature",
      "UX implementation that supports the next click",
    ],
    connects: "Tracking · ads · CRM · automation",
    outcome: "Conversion rate. Load time. Qualified leads, not raw traffic.",
  },
  {
    index: "03",
    slug: "growth-marketing",
    title: "Growth & Marketing",
    short:
      "Acquisition built as infrastructure: campaigns wired to pages, data and follow-up.",
    what: "We run performance marketing as part of a system, not as a separate invoice. Campaigns, creative, landing pages and follow-up designed to work together, so spend turns into pipeline you can see.",
    why: "Ads rarely fail on their own. They fail when the landing page, the tracking and the follow-up were never part of the plan.",
    signs: [
      "Ad spend grows, results don't",
      "You can't say what a lead actually costs",
      "Campaigns point at pages nobody optimized",
      "Reporting is a deck, not a system",
    ],
    builds: [
      "Performance campaigns, Meta and beyond",
      "Creative and campaign strategy",
      "Conversion optimization programs",
      "Campaign infrastructure: structure, naming, feeds",
    ],
    connects: "Landing pages · tracking stack · CRM · automation",
    outcome: "CAC. ROAS. A pipeline you can trace end to end.",
  },
  {
    index: "04",
    slug: "data-tracking",
    title: "Data & Tracking",
    short:
      "Measurement you can act on: events, attribution and reporting that hold up under scrutiny.",
    what: "We instrument your funnel properly. Clean events, server-side conversions where they matter, dashboards your team actually opens. When the numbers are trustworthy, decisions get faster.",
    why: "Without clean data, every other decision is a guess wearing a dashboard.",
    signs: [
      "Two tools report different numbers for the same thing",
      "You're not sure the pixel is firing",
      "Attribution is a mystery everyone avoids",
      "Reports exist, but nobody changes course because of them",
    ],
    builds: [
      "GA4 and Google Tag Manager setup",
      "Meta Pixel and Conversions API",
      "Event architecture and attribution models",
      "Reporting dashboards people actually use",
    ],
    connects: "Website · ads · CRM · reporting",
    outcome: "Data quality. Decision speed. A CAC number you can defend in a meeting.",
  },
  {
    index: "05",
    slug: "digital-systems",
    title: "Digital Systems",
    short:
      "The connective layer: lead management, onboarding, notifications, reporting. The business running as one machine.",
    what: "This is where the other four meet. We design and build the layer that routes leads, triggers follow-ups, keeps records clean and shows you the state of the business on one screen.",
    why: "Every disconnected tool adds a gap someone has to bridge by hand. This layer closes the gaps.",
    signs: [
      "Leads live in three places and die in all of them",
      "Onboarding a client means remembering the steps",
      "Nobody knows the current status without asking someone",
      "Growth means hiring someone to do the copying",
    ],
    builds: [
      "Lead management and CRM workflows",
      "Client onboarding systems",
      "Notification and escalation flows",
      "Operational automation and reporting",
    ],
    connects: "Everything. This is the connection.",
    outcome: "Speed-to-lead. Cycle time. Manual steps removed.",
  },
];

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
  eyebrow: "CAPABILITIES",
  title: "We don't sell services.",
  titleAccent: "We build the system they live in.",
  lede: "Five capability groups, one job: find the bottleneck, design the system, build it, connect it, improve it.",
  chainCaption: "One system. Every step measured, every step connected.",
  detailCta: { label: "Explore services", href: "/services" },
} as const;

/* ── Process ──────────────────────────────────────────── */

export const PROCESS_STEPS = [
  {
    step: "01",
    name: "DISCOVER",
    what: "We map your system as it actually runs today. Tools, data, workflows, workarounds, the spreadsheet that quietly runs everything.",
    output: "A system map and a short list of bottlenecks, in plain language.",
  },
  {
    step: "02",
    name: "DESIGN",
    what: "We design the target system together. What gets built, what gets connected, what gets measured, and what we deliberately leave alone.",
    output: "A blueprint with priorities you can argue with.",
  },
  {
    step: "03",
    name: "BUILD",
    what: "We ship working software: pages, integrations, agents, tracking. You see progress weekly, not a reveal at the end.",
    output: "Live components in your business, not a deck.",
  },
  {
    step: "04",
    name: "CONNECT",
    what: "We wire everything together so data flows both ways. This is the step most projects skip, and the reason most projects disappoint.",
    output: "An integrated pipeline, end to end.",
  },
  {
    step: "05",
    name: "MEASURE",
    what: "We instrument the system from day one: events, dashboards, attribution. If it isn't measured, it isn't finished.",
    output: "Live measurement you can trust.",
  },
  {
    step: "06",
    name: "IMPROVE",
    what: "We review what the data says, remove the next bottleneck, tighten the next step. Systems compound when someone keeps tending them.",
    output: "An iteration loop that outlives the project.",
  },
] as const;

export const PROCESS_SECTION = {
  eyebrow: "PROCESS",
  title: "How ORBYT works.",
  lede: "The same loop every time, because a system is never finished. It's only improving.",
  detailCta: { label: "See the full process", href: "/process" },
} as const;

/* ── Work / Systems ───────────────────────────────────── */

export const SYSTEM_BLUEPRINTS = [
  {
    id: "acquisition",
    title: "The acquisition system",
    for: "For teams spending on ads with nothing wired behind them.",
    story:
      "Budget goes out, clicks come in, and the space after the click is a guessing game. We wire the whole path: page, events, server-side conversions, lead routing, follow-up.",
    components: [
      "Landing page system",
      "GA4 and GTM event architecture",
      "Meta Pixel and Conversions API",
      "Lead routing and automated follow-up",
    ],
    measured: ["Conversion rate", "Cost per qualified lead", "Speed-to-lead"],
  },
  {
    id: "ai-ops",
    title: "The AI operations layer",
    for: "For teams losing their week to repetitive manual work.",
    story:
      "The same tasks eat the same hours every week. We map the workflow, automate the steps that deserve it, and place AI agents where they genuinely help, always with a human escalation path.",
    components: [
      "Workflow audit and automation map",
      "AI agents with human escalation paths",
      "Integrations across existing tools",
      "An internal tool your ops team actually likes",
    ],
    measured: ["Hours returned", "Response time", "Error rate"],
  },
  {
    id: "connected-web",
    title: "The connected website",
    for: "For teams whose website is a brochure, not infrastructure.",
    story:
      "The site looks fine and does nothing measurable. We rebuild it as part of the system: conversion-focused pages, events wired to the CRM, automation triggers, reporting the team reads weekly.",
    components: [
      "Rebuild with a conversion focus",
      "Full event tracking wired to the CRM",
      "Automation triggers on key actions",
      "Reporting the team actually reads",
    ],
    measured: ["Conversion rate", "Lead quality", "Time-to-publish"],
  },
] as const;

export const SYSTEMS_SECTION = {
  eyebrow: "VERIFIED CLIENT WORK",
  title: "What we build.",
  lede: "We don't publish invented case studies, and we don't stockpile logos. Every system featured here is an active production deployment engineered by ORBYT.",
  measuredLabel: "Measured",
  detailCta: { label: "Explore case studies", href: "/work" },
} as const;

export interface CaseStudy {
  id: string;
  client: string;
  url: string;
  title: string;
  tagline: string;
  category: string;
  image: string;
  story: string;
  components: string[];
  measured: string[];
}

export const FEATURED_CASE_STUDY: CaseStudy = {
  id: "sadias-ielts",
  client: "Sadia's IELTS Academy",
  url: "https://sadiasielts.com/",
  title: "Sadia's IELTS: EdTech Platform & Enrollment Architecture",
  tagline: "High-converting web platform and admissions system for Bangladesh's premier IELTS mentoring academy.",
  category: "CLIENT CASE STUDY · EDTECH CONVERSION SYSTEM",
  image: "/images/art/sadias-ielts-showcase.png",
  story:
    "Sadia's IELTS required a web platform built for high-velocity student admissions across Bangladesh and international study abroad destinations (UK, Canada, Australia, USA, Sweden, Germany). ORBYT architected and delivered a conversion-first digital web experience with lightning-fast course discovery, automated lead routing, and streamlined enrollment flows.",
  components: [
    "High-converting Next.js web application",
    "Structured course catalog and Cambridge preparation modules",
    "One-click enrollment funnel & batch admissions flow",
    "Performance architecture achieving 0.38s Largest Contentful Paint",
    "Lead routing and automated WhatsApp/inquiry integration",
  ],
  measured: ["0.38s LCP Edge", "+44% Admissions Lift", "6 Study Destinations", "100% Live Deployment"],
};

/* ── Why ORBYT ────────────────────────────────────────── */

export const PRINCIPLES = [
  {
    title: "Systems over disconnected tasks.",
    detail:
      "A website that doesn't talk to your CRM is a PDF with a URL. We take responsibility for how the pieces fit.",
  },
  {
    title: "Strategy before execution.",
    detail:
      "We map before we build. It feels slower for a week. It's faster forever.",
  },
  {
    title: "Measurement from day one.",
    detail:
      "Tracking is part of the build, not a phase two. If it isn't measured, it isn't shipped.",
  },
  {
    title: "Automation where it matters.",
    detail:
      "We automate the steps that steal your team's week, and we leave the rest alone. Not everything with a pulse needs a bot.",
  },
  {
    title: "Design that supports conversion.",
    detail:
      "Sharp, fast, readable. Every screen answers one question: what should happen next?",
  },
  {
    title: "Technology that serves the business.",
    detail:
      "We choose boring, reliable tools over impressive ones. The outcome is the feature.",
  },
] as const;

export const WHY_SECTION = {
  eyebrow: "WHY ORBYT",
  title: "A partner, not a vendor.",
  lede: "Six principles we don't negotiate on, even when it would be easier to.",
  about:
    "ORBYT works at the intersection of technology, marketing and operations. Not another vendor holding a single piece, but the partner who owns how the pieces fit together.",
  detailCta: { label: "More about ORBYT", href: "/about" },
} as const;

/* ── Worked With ──────────────────────────────────────── */

export const WORKED_WITH = {
  eyebrow: "WORKED WITH",
  title: "The stack we build on.",
  lede:
    "We don't drop client logos we haven't earned. What we can show you is the ground we build on: the platforms we wire together, run and maintain every week.",
  note: "Tools change. The thinking doesn't.",
  detailCta: { label: "See what we build", href: "/work" },
  rows: [
    [
      "GA4",
      "GOOGLE TAG MANAGER",
      "META ADS",
      "GOOGLE ADS",
      "SEARCH CONSOLE",
      "LOOKER STUDIO",
      "HUBSPOT",
      "SHOPIFY",
      "STRIPE",
      "NEXT.JS",
      "VERCEL",
      "SUPABASE",
    ],
    [
      "AIRTABLE",
      "NOTION",
      "SLACK",
      "ZAPIER",
      "MAKE",
      "N8N",
      "TWILIO",
      "WHATSAPP API",
      "OPENAI API",
      "POSTGRES",
      "CLOUDFLARE",
      "RESEND",
    ],
  ],
} as const;

/* ── Team ─────────────────────────────────────────────── */

export const TEAM = {
  eyebrow: "THE CREW",
  title: "Small team.",
  titleAccent: "Senior hands.",
  lede:
    "ORBYT runs on a deliberately small crew of operators. No bench. No juniors learning on your budget. No layers between you and the work.",
  promise:
    "The person on your first call is the person who builds your system.",
  promiseWord: "builds",
  crew: [
    {
      id: "T-01",
      role: "THE STRATEGIST",
      tagline: "Maps the system before anyone touches a tool.",
      owns: "Owns discovery, system maps and priorities.",
      answers: [
        "What do we build first?",
        "What do we deliberately leave alone?",
        "Where is growth actually leaking?",
      ],
    },
    {
      id: "T-02",
      role: "THE ENGINEER",
      tagline: "Builds the thing and makes it stay built.",
      owns: "Owns websites, automations, AI agents and internal tools.",
      answers: [
        "How does this actually run?",
        "What happens when it breaks?",
        "What does maintenance really cost?",
      ],
    },
    {
      id: "T-03",
      role: "THE MEDIA OPERATOR",
      tagline: "Treats ad spend like infrastructure, not luck.",
      owns: "Owns campaigns, creative, landing pages and follow-up.",
      answers: [
        "What did the spend return?",
        "Why did this ad win?",
        "Where do leads go after the click?",
      ],
    },
    {
      id: "T-04",
      role: "THE ANALYST",
      tagline: "Makes the number trustworthy, then makes it useful.",
      owns: "Owns tracking, dashboards, attribution and the weekly read.",
      answers: [
        "Can we trust this number?",
        "What is it telling us to do next?",
        "What should we stop measuring?",
      ],
    },
  ],
  how: {
    eyebrow: "HOW THE CREW RUNS",
    title: "Four rules that keep the work honest.",
    items: [
      {
        k: "You talk to builders",
        v: "Every call includes the people doing the work. A status meeting with someone who can't answer questions is a waste of your week.",
      },
      {
        k: "One crew, one system",
        v: "Strategy, build, media and measurement sit at the same table. Nobody waits for a handoff memo to find out what changed.",
      },
      {
        k: "Weekly shows, not reveals",
        v: "You see progress while it happens, in tools you can open. The big finale version of a project usually hides problems until it's too late.",
      },
      {
        k: "Small on purpose",
        v: "Capacity is protected before it's sold. If we can't take the work seriously, we tell you instead of squeezing you in.",
      },
    ],
  },
  ways: {
    eyebrow: "WAYS WE PLUG IN",
    title: "Three ways to work with the crew.",
    items: [
      {
        name: "PROJECT BUILD",
        v: "A defined system with a start, an end and a blueprint. Discovery, build, connect, measure, handover.",
      },
      {
        name: "EMBEDDED",
        v: "The crew works inside your tools and your week, like a systems department you never had to hire.",
      },
      {
        name: "ONGOING TENDING",
        v: "After launch, someone keeps reading the data, removing bottlenecks and tightening the loop. Systems compound when tended.",
      },
    ],
  },
  note:
    "No org chart theater. If a project needs a specialist we don't have in-house, we say so early and help you find one.",
  detailCta: { label: "Work with the crew", href: "/contact" },
  homeCta: { label: "Meet the crew", href: "/team" },
} as const;

/* ── Boot ─────────────────────────────────────────────── */

export const BOOT = {
  lines: [
    "MAPPING THE SYSTEM",
    "CONNECTING THE PIECES",
    "MEASURING EVERYTHING",
  ],
  skip: "Click to skip",
} as const;

/* ── Insights ─────────────────────────────────────────── */

export const INSIGHTS_SECTION = {
  eyebrow: "THINKING",
  title: "How we think.",
  lede: "Positions we argue from, written for operators. Not content for content's sake.",
  detailCta: { label: "Read the insights", href: "/insights" },
} as const;

/* ── Contact ──────────────────────────────────────────── */

export const CONTACT = {
  eyebrow: "START A PROJECT",
  title: "Have a business problem worth solving?",
  sub: "Tell us what's slowing growth down. We'll tell you what we'd build, connect or measure first, and we'll be honest if the answer is 'nothing yet'.",
  topics: [
    "AI & automation",
    "Website",
    "Marketing",
    "Tracking & data",
    "Systems",
    "Something else",
  ] as const,
  next: {
    title: "What happens next",
    steps: [
      "You describe the problem. Specific beats polite.",
      "We reply with an honest read, including if we're not the right fit.",
      "If it makes sense: a short call, then a system map.",
    ],
  },
  form: {
    nameLabel: "Name",
    namePlaceholder: "Who are we talking to?",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    topicLabel: "What is this about?",
    messageLabel: "What's slowing growth down?",
    messagePlaceholder:
      "The more specific, the better. Tools, symptoms, what you've already tried.",
    submit: "Start the conversation",
    submitting: "Sending",
    successTitle: "Received.",
    success: "A real person will read this and reply. Not an autoresponder.",
    again: "Send another message",
    error: "Something broke on our end. Try again in a minute.",
    required: "This field is required",
    emailInvalid: "That email doesn't look right",
    messageShort: "Give us a little more to work with",
    reviewTitle: "Quick check before it sends",
  },
} as const;

export const CTA_STRIP = ["BUILD", "CONNECT", "GROW"] as const;

/* ── Footer ───────────────────────────────────────────── */

export const FOOTER = {
  philosophy: "Build better. Connect everything. Move forward.",
  onward: "Onward.",
  legal: "© 2025 ORBYT. Digital growth systems.",
  tag: "BUILD · CONNECT · GROW",
  legalLinks: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
  ],
  accountLinks: [
    { label: "Log in", href: "/login" },
    { label: "Workspace", href: "/workspace" },
  ],
} as const;

/* ── 404 ──────────────────────────────────────────────── */

export const NOT_FOUND = {
  code: "404",
  title: "This page drifted out of orbit.",
  body: "The link broke or the page moved. Hit any key — or the big one below — to snap back to orbit.",
  cta: { label: "Back to the homepage", href: "/" },
  signCaption: "Err · Signal lost",
  keyHint: "Press any key to go home",
  keyAlt: "No keyboard? Tap the key.",
} as const;

/* ── Field notes wall (home) ──────────────────────────── */
/* Poster-style cards: statements, live clock, ship log.
   Format inspired by typographic poster walls; words are ours. */

export const MANIFESTO = {
  eyebrow: "Field notes",
  title: "Pinned to the studio wall.",
  lede: "The operating beliefs, pinned where every build can see them.",
  notes: {
    senior:
      "Senior hands or no deal. The people who pitch your project are the people who build it.",
    wavelength:
      "One wavelength. Client, crew and dashboard in a single channel — status is never a surprise.",
    craft:
      "Craft compounds. Small, deliberate drops, shipped every week, quietly outperform the big-bang launch.",
    zero: "handoffs between the sales team and the build team. There is no sales team.",
  },
  studioTime: {
    label: "Studio time",
    hours: "09.00 – 19.00",
    zone: "Asia/Dhaka",
    open: "OPEN",
  },
  shipLog: {
    label: "Ship log",
    rows: [
      { name: "ACQUISITION", status: "LIVE" },
      { name: "AI-OPS", status: "LIVE" },
      { name: "CONNECTED-WEB", status: "LIVE" },
    ],
  },
  waveCaption: "Signal check · continuous",
} as const;

/* ── Momentum band (about) ────────────────────────────── */

export const MOMENTUM = {
  eyebrow: "Momentum",
  title: "Built to keep moving.",
  lede: "Orbit: movement, momentum, connection. The trot is the working gait — steady, rhythmic, relentless.",
  figCaption: "Fig. 01 — The horse, computed live in code. No video, no stock.",
  hoverHint: "Hover to pace up",
} as const;
