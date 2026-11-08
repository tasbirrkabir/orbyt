/**
 * ORBYT insights: full essays. Structured blocks, no MDX needed.
 * Voice: operator to operator. Concrete scenes. Zero em-dashes.
 * Nothing fabricated: these are positions, not reported facts.
 */

export interface EssayBlock {
  type: "p" | "h2" | "quote" | "list";
  text?: string;
  items?: string[];
}

export interface Essay {
  slug: string;
  title: string;
  dek: string;
  minutes: number;
  blocks: EssayBlock[];
}

export const ESSAYS: Essay[] = [
  {
    slug: "ai-strategies-are-workflow-problems",
    title: "Most AI strategies are workflow problems",
    dek: "Before asking what AI can do for your business, it helps to know what your business actually does. Most bottlenecks turn out to be processes, not models.",
    minutes: 4,
    blocks: [
      {
        type: "p",
        text: "A founder recently told us they needed 'an AI strategy'. We asked one question: walk me through what happens after someone fills in your contact form. The answer took ninety seconds and involved three people, two inboxes, a Slack message that sometimes gets missed, and a spreadsheet updated 'when things calm down'.",
      },
      {
        type: "p",
        text: "Nothing in that story is an AI problem. Every part of it is a workflow problem. And that's the pattern we see almost every time a business says they want AI: the wish is for technology, but the pain lives in a process nobody designed on purpose.",
      },
      { type: "h2", text: "The question behind the question" },
      {
        type: "p",
        text: "When someone says they want AI, they usually mean one of three things. They want to stop losing leads. They want to stop paying people to move data between tools. Or they're worried about falling behind and want to feel in control of that fear. All three are legitimate. None of them starts with a model.",
      },
      {
        type: "p",
        text: "So we start somewhere less exciting. We map what actually happens today. Who touches what, in which order, and where things stall. It's unglamorous work. It's also the only way to place AI somewhere it will still be helping a year from now.",
      },
      { type: "h2", text: "Where AI genuinely helps" },
      {
        type: "list",
        items: [
          "First responses. A draft reply to every inbound lead within a minute, with a human approving anything sensitive.",
          "Repetitive data work. Extraction, enrichment, routing. The tasks that are too small to hire for and too important to drop.",
          "Internal answers. New team members asking the same questions, answered from the documents your company already wrote.",
        ],
      },
      {
        type: "p",
        text: "Notice what's missing: reinventing the business. AI placed on top of a broken process gives you a faster broken process. That's not transformation, that's acceleration in the wrong direction.",
      },
      { type: "h2", text: "The honest test" },
      {
        type: "p",
        text: "Here's a test we use before automating anything. If the task disappeared tomorrow, would anyone miss the outcome? If the answer is no, delete it. If the answer is yes but nobody enjoys it, automate it. If the answer is yes and someone takes pride in it, give them better tools and leave them alone.",
      },
      {
        type: "quote",
        text: "The goal was never to use AI. The goal is a team that spends its week on work that matters.",
      },
      {
        type: "p",
        text: "So before you ask for an AI strategy, ask for a workflow map. It's cheaper, it's faster, and there's a decent chance the bottleneck dissolves before any model gets involved. And if AI is the right answer, you'll place it with confidence instead of hope.",
      },
    ],
  },
  {
    slug: "tracking-is-lying-to-you",
    title: "Your tracking is probably lying to you",
    dek: "Duplicate events, missing server-side conversions, attribution gaps. Most ad accounts optimize against bad data, confidently.",
    minutes: 4,
    blocks: [
      {
        type: "p",
        text: "There's a specific feeling that comes with looking at two dashboards that disagree. The ads platform says the campaign works. The CRM says the leads were junk. Both are certain. You're stuck in the middle, paying for whichever story is wrong.",
      },
      {
        type: "p",
        text: "We've audited enough accounts to say this plainly: when tracking breaks, it usually breaks quietly. Nothing crashes. No alert fires. The numbers keep arriving, the graphs keep going up and to the right, and the decisions keep coming. The only problem is that the data underneath is fiction.",
      },
      { type: "h2", text: "The usual suspects" },
      {
        type: "list",
        items: [
          "The same conversion counted twice, once by the browser and once by the server, with nobody reconciling the two.",
          "A pixel that fires on page load instead of on purchase, because someone tested it once and moved on.",
          "Form submissions that never became events, so the best leads in the funnel are invisible to optimization.",
          "Cookie consent swallowing measurement on the browsers that matter most, leaving a biased sample that looks complete.",
        ],
      },
      {
        type: "p",
        text: "None of these are exotic. All of them are common. And every one of them teaches your ad platform to chase the wrong people, because optimization is only ever as honest as the signal you feed it.",
      },
      { type: "h2", text: "Why this happens" },
      {
        type: "p",
        text: "Tracking breaks because it's owned by nobody. The website gets rebuilt and the tags don't come along. The marketing team installs new scripts and the old ones keep firing. The developer knows, the marketer doesn't, and the founder sees two healthy-looking dashboards. Everyone is doing their job. The system has no owner, so it decays.",
      },
      {
        type: "quote",
        text: "Without clean data, every other decision is a guess wearing a dashboard.",
      },
      { type: "h2", text: "What trustworthy looks like" },
      {
        type: "p",
        text: "A measurement setup you can trust has three properties. Every important action fires exactly one event, and you can prove it. Server-side conversions back up browser-side ones, so the picture survives browsers getting stricter. And someone owns the map: a short document that says what's tracked, where it flows, and who to ask when something looks off.",
      },
      {
        type: "p",
        text: "That's not a big project. It's a focused one. And it changes the quality of every decision that comes after it, which is why we consider it part of the build rather than a phase two. If you take one thing from this: before you optimize the campaign, make sure the scoreboard is wired to the right game.",
      },
    ],
  },
  {
    slug: "landing-page-is-a-system",
    title: "A landing page is a system, not a page",
    dek: "It inherits your ads, your tracking, your CRM and your follow-up. Treat it alone and it will underperform alone.",
    minutes: 4,
    blocks: [
      {
        type: "p",
        text: "Someone sends you a link to a landing page and asks why it isn't converting. You open it. The headline is fine, the design is fine, the button is where buttons go. Everything about the page is fine. So you A/B test the headline, and the needle moves a percent or two, and the problem remains.",
      },
      {
        type: "p",
        text: "Here's the uncomfortable possibility: the page was never the problem. The page is one part of a system that includes the ad that brought the visitor, the speed at which the page loaded, the form that swallowed their details, and the follow-up that did or didn't happen. Judging the page alone is like judging a goalkeeper whose team never passes the ball.",
      },
      { type: "h2", text: "The page inherits everything" },
      {
        type: "p",
        text: "A visitor arrives with a promise already made. The ad said one thing, the page says something slightly different, and that small mismatch costs you the conversion. The page loads in four seconds on their phone, and a third of them never see your headline at all. They submit the form and hear nothing for a day, and by then the feeling has passed. Every one of those failures gets recorded as 'the page didn't convert'.",
      },
      {
        type: "list",
        items: [
          "Message match: the ad's promise and the page's first line should be the same sentence in different words.",
          "Speed: on mobile, seconds are the first conversion factor, before any copy is read.",
          "Handoff: the form is a contract. What happens in the next five minutes decides whether the page 'worked'.",
          "Signal: if the conversion isn't tracked correctly, the platform optimizes toward the wrong visitors tomorrow.",
        ],
      },
      {
        type: "quote",
        text: "Judging a landing page alone is like judging a goalkeeper whose team never passes the ball.",
      },
      { type: "h2", text: "What we do instead" },
      {
        type: "p",
        text: "We build pages as part of the acquisition system. That means the page, the events, the routing and the follow-up are designed in one sitting, by people who can see all four. It also means measurement is honest enough to tell us which part of the chain actually failed, so improvement lands where it matters.",
      },
      {
        type: "p",
        text: "The next time a page underperforms, resist the headline test for a week. Trace the whole path instead, from the click to the follow-up call. The fix is usually waiting one step before or one step after the place everyone is looking.",
      },
    ],
  },
  {
    slug: "disconnected-tools-silent-tax",
    title: "Disconnected tools are a silent tax",
    dek: "Nobody budgets the hours lost moving data between tools that should already be connected. It's the most expensive line item nobody sees.",
    minutes: 4,
    blocks: [
      {
        type: "p",
        text: "Run a quick experiment this week. Ask your team to write down every time they copy information from one tool into another. Not the dramatic cases, the ordinary ones. The lead from the form into the CRM. The order from the store into the spreadsheet. The number from the dashboard into the Monday meeting deck.",
      },
      {
        type: "p",
        text: "What comes back is usually a quiet shock. Not because any single copy-paste is painful, but because of what they add up to: hours of your most capable people doing the work of a pipe. That's the silent tax. It never appears on a budget, it scales with growth, and it feels like normal because it's been normal for years.",
      },
      { type: "h2", text: "Why smart teams stay disconnected" },
      {
        type: "p",
        text: "Nobody chose this. It happened one tool at a time, the way businesses actually grow. A newsletter tool here, a CRM there, a scheduling app somebody loved. Each decision made sense. Each one added a small gap. And gaps don't announce themselves, they just quietly assign themselves to the most organized person on your team.",
      },
      {
        type: "p",
        text: "The other reason is a certain kind of advice: 'just integrate everything'. But integration for its own sake creates its own mess, with twice the failure points. The point was never connected tools. The point is a business where information moves itself, so people can do the work only people can do.",
      },
      { type: "h2", text: "What the tax actually buys you" },
      {
        type: "list",
        items: [
          "Slower leads: the enquiry that arrived on Friday lives in someone's inbox until Monday.",
          "Bigger errors: every manual copy is a chance for a wrong number, and wrong numbers compound.",
          "Fragile growth: every new client adds manual work, so scaling feels dangerous instead of exciting.",
          "Quiet attrition: capable people don't leave because of hard problems. They leave because of pointless ones.",
        ],
      },
      {
        type: "quote",
        text: "The most expensive software in your business is the space between two tools that don't talk.",
      },
      {
        type: "p",
        text: "You don't fix this with a weekend of Zapier and good intentions. You fix it by mapping the system, finding the three flows that matter most, and connecting those properly, with someone accountable for keeping them healthy. Start with the flow where data gets copied most often. That's where the tax is highest, and that's where the relief will be visible within a month.",
      },
    ],
  },
  {
    slug: "how-to-choose-software-development-company-bangladesh",
    title: "How to choose a software development company in Bangladesh",
    dek: "The software agency market in Bangladesh is divided between low-cost outsourcing shops and product-minded systems builders. Here is how to evaluate real technical capability.",
    minutes: 6,
    blocks: [
      {
        type: "p",
        text: "Selecting a software engineering partner in Bangladesh often starts with a portfolio review and ends in misaligned expectations. Hundreds of agencies claim full-stack competence, but when projects start, companies discover their software was outsourced to junior subcontractors or built on abandoned template engines.",
      },
      {
        type: "p",
        text: "The difference between an outsourcing shop and an engineering partner comes down to architecture and accountability. You are not buying hours of coding; you are purchasing the reliability of your operational backbone.",
      },
      { type: "h2", text: "Three questions to ask before signing" },
      {
        type: "list",
        items: [
          "Who actually writes and reviews the code? Speak directly with the systems architect who will design your database schema and API layer, not just an account executive.",
          "What is their approach to performance and observability? Ask about their Core Web Vitals thresholds, error tracking telemetry, and relational schema migrations.",
          "Do they understand business workflow or just software syntax? Software that does not integrate with your real customer lifecycle creates expensive technical debt.",
        ],
      },
      {
        type: "quote",
        text: "A low hourly rate is the most expensive way to build custom software when the architecture has to be rewritten eighteen months later.",
      },
      { type: "h2", text: "The modern technical baseline" },
      {
        type: "p",
        text: "In 2026, serious software engineering requires full TypeScript type safety, modern relational databases like PostgreSQL, automated CI/CD pipelines, and sub-second page rendering. When vetting an agency in Dhaka or across Bangladesh, inspect their live production deployments and ask to inspect their commit history and code review process.",
      },
    ],
  },
  {
    slug: "custom-software-vs-ready-made",
    title: "Custom software vs ready-made SaaS: making the strategic decision",
    dek: "When does an off-the-shelf subscription stop being economical, and when is building proprietary software the only way to protect your business margin?",
    minutes: 5,
    blocks: [
      {
        type: "p",
        text: "Every growing company reaches the SaaS plateau: you started with two affordable software subscriptions, and three years later you are paying for eight separate tools, none of which talk to each other without human intervention.",
      },
      {
        type: "p",
        text: "The debate between custom software and off-the-shelf SaaS is rarely an either-or decision. It is an economic calculation of operational efficiency versus subscription lock-in.",
      },
      { type: "h2", text: "When ready-made SaaS wins" },
      {
        type: "list",
        items: [
          "Standardized commodity workflows like accounting, payroll, and corporate email.",
          "Early-stage hypothesis testing before your actual operational process has stabilized.",
          "When existing tools satisfy 90% of your workflow without requiring manual daily workarounds.",
        ],
      },
      { type: "h2", text: "When custom software becomes essential" },
      {
        type: "list",
        items: [
          "Your competitive moat lives in a proprietary process or operational algorithm.",
          "Seat-based SaaS fees scale faster than your profit margins as your team expands.",
          "Critical business data is trapped across disparate platforms with no unified reporting.",
          "Compliance, data sovereignty, or unique regional payment gateway requirements demand direct database ownership.",
        ],
      },
      {
        type: "quote",
        text: "If your core operational workflow is what makes your business valuable, running it on someone else's generic platform is a strategic vulnerability.",
      },
    ],
  },
  {
    slug: "software-development-cost-bangladesh",
    title: "Understanding software development costs in Bangladesh",
    dek: "A transparent breakdown of custom software development pricing in Bangladesh: what drives costs, where budgets leak, and how to structure milestones.",
    minutes: 6,
    blocks: [
      {
        type: "p",
        text: "Software development pricing in Bangladesh spans an enormous range. A company may receive quotes ranging from 50,000 BDT from a solo freelancer to millions of BDT from enterprise consulting firms for seemingly identical project briefs. Understanding why this variance exists is essential for realistic budgeting.",
      },
      { type: "h2", text: "What actually drives software cost" },
      {
        type: "list",
        items: [
          "Architectural complexity: simple CRUD dashboards require significantly less engineering than distributed event pipelines, multi-tenant databases, or high-concurrency systems.",
          "System integrations: connecting third-party payment gateways, legacy ERPs, CRMs, and messaging webhooks involves rigorous error recovery and edge-case handling.",
          "Observability and security: role-based access control, encrypted session management, automated backups, and zero-compromise Core Web Vitals optimization.",
        ],
      },
      {
        type: "quote",
        text: "The cost of building software is dwarfed by the cost of maintaining broken, undocumented code. Always budget for architecture before features.",
      },
      { type: "h2", text: "How ORBYT structures project delivery" },
      {
        type: "p",
        text: "Rather than open-ended billing that drifts over time, we structure projects around fixed-scope milestones with verifiable technical criteria. You receive direct access to live staging environments, weekly architecture reviews, and complete code repository ownership from Day 1.",
      },
    ],
  },
  {
    slug: "how-saas-products-are-built",
    title: "How modern SaaS products are built: from architecture to scale",
    dek: "A technical blueprint for launching scalable software-as-a-service: multi-tenancy, billing lifecycles, authentication, and edge infrastructure.",
    minutes: 7,
    blocks: [
      {
        type: "p",
        text: "Building a software-as-a-service (SaaS) product requires an entirely different engineering mindset than building a traditional website or internal tool. SaaS platforms must maintain strict tenant isolation, handle dynamic billing subscriptions, and survive traffic spikes without manual intervention.",
      },
      { type: "h2", text: "The foundational SaaS layers" },
      {
        type: "list",
        items: [
          "Tenant isolation: choosing between row-level security (RLS) in PostgreSQL or separate database schemas depending on regulatory and security requirements.",
          "Billing infrastructure: building robust webhook handlers for Stripe, Lemon Squeezy, or regional payment systems that gracefully handle failed charges, upgrades, and cancellations.",
          "Authentication and RBAC: managing organizational teams, invite links, and granular member permissions.",
          "Edge distribution: serving static assets and dynamic cached API responses from global edge nodes for sub-second latency.",
        ],
      },
      {
        type: "quote",
        text: "A successful SaaS product is an engineering system where customer acquisition, billing, and feature delivery operate in total harmony.",
      },
      { type: "h2", text: "Avoiding Day 1 overengineering" },
      {
        type: "p",
        text: "The most common fatal mistake in early-stage SaaS development is microservice premature optimization. A modular monolithic architecture built with Next.js, TypeScript, and PostgreSQL can easily scale to hundreds of thousands of active users with near-zero infrastructure overhead, allowing founders to focus on user feedback and unit economics.",
      },
    ],
  },
];

export function getEssay(slug: string): Essay | undefined {
  return ESSAYS.find((e) => e.slug === slug);
}
