/**
 * The Command Center demo stories. Intentionally public: the three
 * demo accounts ship their credentials in the client bundle and hold
 * only sample data, clearly labeled inside the portal. Anyone can
 * explore the full product without handing over an email; nobody's
 * real data is involved.
 *
 * Three tenants on purpose, matching the three service shapes ORBYT
 * actually sells:
 *   A  ORB-DEMO   Demo Roasters  website only
 *   B  ORB-NOVA   Nova Foods     website + marketing (adds Reports)
 *   C  ORB-ATLAS  Atlas Clinics  full service (adds Reports + Systems)
 *
 * /api/demo rebuilds all of this idempotently: every step is an
 * upsert or a count-guarded create, so a wiped database is repaired
 * on the next click.
 */

export type DemoAccount = {
  clientId: string;
  email: string;
  password: string;
  name: string;
  organizationName: string;
  tier: "WEBSITE_ONLY" | "MARKETING_WEBSITE" | "FULL_SERVICE";
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    clientId: "ORB-DEMO",
    email: "demo@orbyt.com",
    password: "orbyt-demo",
    name: "Demo",
    organizationName: "Demo Roasters",
    tier: "WEBSITE_ONLY",
  },
  {
    clientId: "ORB-NOVA",
    email: "nova@orbyt.com",
    password: "orbyt-nova",
    name: "Tasnim Rahman",
    organizationName: "Nova Foods",
    tier: "MARKETING_WEBSITE",
  },
  {
    clientId: "ORB-ATLAS",
    email: "atlas@orbyt.com",
    password: "orbyt-atlas",
    name: "Dr. Farhana Karim",
    organizationName: "Atlas Clinics",
    tier: "FULL_SERVICE",
  },
];

// Back-compat: the flagship demo account used across login copy.
export const DEMO_CLIENT_ID = DEMO_ACCOUNTS[0].clientId;
export const DEMO_EMAIL = DEMO_ACCOUNTS[0].email;
export const DEMO_PASSWORD = DEMO_ACCOUNTS[0].password;
export const DEMO_NAME = DEMO_ACCOUNTS[0].name;

/**
 * Sample profile for the flagship demo. Challenge strings must stay in
 * sync with ONBOARDING.challenges in src/content/flows.ts: the system
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

export const DEMO_AGE_DAYS = 6;

/** Two legacy briefs so the conversation timeline keeps its history. */
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
