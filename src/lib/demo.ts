/**
 * The public demo account. Intentionally public: the credentials ship in
 * the client bundle and the account holds only sample data, clearly
 * labeled as a demo inside the workspace. Anyone can explore the layout
 * without handing over an email; nobody's real data is involved.
 *
 * /api/demo rebuilds all of this idempotently, so even if the database
 * is reset or someone deletes the account, one click brings it back.
 */

export const DEMO_EMAIL = "demo@orbyt.com";
export const DEMO_PASSWORD = "orbyt-demo";
export const DEMO_NAME = "Demo";

/** The demo client's portal key, shown on the login page and in the portal. */
export const DEMO_CLIENT_ID = "ORB-DEMO";

/**
 * Sample profile. Challenge strings must stay in sync with
 * ONBOARDING.challenges in src/content/flows.ts: the dashboard's system
 * map routes friction to pillars by substring match on these phrases.
 */
export const DEMO_PROFILE = {
  company: "Demo Roasters",
  industry: "eCommerce",
  stage: "Growing steadily",
  challenges: [
    "Leads go cold before anyone replies",
    "The team drowns in manual busywork",
    "Ads spend, but the data can't be trusted",
  ],
  tools: "Shopify, Meta Ads, Klaviyo, Google Sheets",
  goal: "Every lead gets a reply within the hour, and the Monday report builds itself.",
} as const;

/**
 * Two sample briefs so the conversation timeline and the path tracker
 * have real rows to render. Written like a customer would write, because
 * a demo full of lorem ipsum says nothing about how the workspace feels.
 */
export const DEMO_SUBMISSIONS = [
  {
    topic: "Systems",
    message:
      "Leads land in three inboxes and a spreadsheet. By the time someone replies, half of them have gone cold. Where would you start?",
    daysAgo: 6,
  },
  {
    topic: "AI & automation",
    message:
      "Every Monday goes to pulling numbers from four tools into one report. Could an agent take the copy-paste part, or is that wishful thinking?",
    daysAgo: 1,
  },
] as const;

/** The demo account was provisioned this many days ago, for a lived-in tenure. */
export const DEMO_AGE_DAYS = 6;

/**
 * The demo client's project, mid-build, with the kind of updates the crew
 * would actually post. Written against the sample profile above, so the
 * portal reads like one coherent story instead of filler.
 */
export const DEMO_PROJECT = {
  title: "The acquisition system",
  status: "BUILD",
  startedDaysAgo: 5,
} as const;

export const DEMO_UPDATES = [
  {
    tag: "SHIPPED",
    title: "Lead routing is live",
    body:
      "Every form submission now lands in one queue with an owner and a one hour timer. The three inboxes and the spreadsheet are retired.",
    daysAgo: 1,
    // Still open: this one is waiting on the client's sign-off.
    ackDaysAgo: null,
  },
  {
    tag: "SHIPPED",
    title: "GA4 events rebuilt",
    body:
      "The full funnel is instrumented from first view to purchase. Ads and the store finally tell the same story.",
    daysAgo: 2,
    // Already signed off, so the demo shows both states in one feed.
    ackDaysAgo: 1,
  },
  {
    tag: "IN PROGRESS",
    title: "Conversions API wiring",
    body:
      "Server-side purchase events go into testing this week, so the ad platforms see every order even when cookies don't.",
    daysAgo: 3,
    ackDaysAgo: null,
  },
  {
    tag: "NOTE",
    title: "System map approved",
    body:
      "We mapped the path from ad click to repeat purchase and agreed where the first bottlenecks live: lead follow-up and weekly reporting.",
    daysAgo: 5,
    ackDaysAgo: null,
  },
] as const;
