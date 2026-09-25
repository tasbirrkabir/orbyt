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
