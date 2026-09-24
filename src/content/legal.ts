/**
 * ORBYT legal pages. Plain, human, honest.
 * Nothing invented: no registration numbers, no fake addresses,
 * no fake jurisdictions. Where project work needs specifics,
 * it's governed by the individual agreement, not this page.
 */

export interface LegalSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface LegalDoc {
  slug: "privacy" | "terms";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy",
    updated: "2025",
    intro:
      "This page explains, in plain language, what ORBYT collects when you use this website, why we collect it, and what happens to it. Short version: we collect the minimum, we use it to work with you, and we don't sell any of it.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "We only collect what the site needs to function and what you choose to give us.",
        ],
        list: [
          "Account details: your name, email and a password, stored only as a secure hash, when you create an account.",
          "Workspace profile: what you tell us during onboarding, so we know where to look first when we work together.",
          "Project conversations: the messages you send through the contact flow, so we can read and reply to them.",
          "Technical basics: standard server logs, kept for security and reliability. No advertising trackers, no data brokers.",
        ],
      },
      {
        heading: "Why we collect it",
        body: [
          "Everything we store exists to do one of three jobs: keep your account working, remember the context of our work together, and reply to you like a human instead of making you repeat yourself. That's the whole list.",
        ],
      },
      {
        heading: "What we never do",
        body: [
          "We don't sell your data. We don't share it with advertisers. We don't build shadow profiles, and we don't email you marketing you never asked for. If we ever want to use your information for something new, we'll ask first.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use one essential cookie: a session cookie that keeps you logged in. No analytics cookies, no advertising cookies, no consent banner theater, because there's nothing to consent to beyond logging in.",
        ],
      },
      {
        heading: "Your data, your call",
        body: [
          "You can ask us at any time to show you what we hold about you, correct it, or delete it. Delete your account and the profile and personal data tied to it go with it. The honest way to reach us for any of this is the contact flow on this site: it reaches the same people who run the database.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Passwords are stored as salted hashes, never as text. Access to the production data is limited to the people who need it to do the work. Nothing connected to the internet is perfectly secure, but we treat your data the way we'd want ours treated: carefully, minimally, and with accountability.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    updated: "2025",
    intro:
      "These terms cover the use of this website. Project work is governed by its own agreement, which we write together and both sign. That document always wins over this page.",
    sections: [
      {
        heading: "Using this site",
        body: [
          "You're welcome to browse, read and create an account. What's not welcome: interfering with the site's operation, scraping it in ways that degrade it for others, or using it to send things that aren't genuine project inquiries.",
        ],
      },
      {
        heading: "Accounts",
        body: [
          "You're responsible for what happens under your login, so choose a good password and don't share it. We may suspend accounts that abuse the site. You can stop using the site whenever you like, and ask us to delete your account whenever you like.",
        ],
      },
      {
        heading: "What we publish",
        body: [
          "The essays and system descriptions on this site represent our thinking and approach. They're written to be honest, but they're not promises of specific results, and they're not professional advice for your specific situation before we've actually talked.",
        ],
      },
      {
        heading: "Project work",
        body: [
          "When we work together, the specifics live in the project agreement: scope, timeline, cost, ownership of what gets built, confidentiality, and what happens if either of us wants out. We keep those documents readable on purpose. If a clause confuses you, ask, and we'll rewrite it until it doesn't.",
        ],
      },
      {
        heading: "Honesty about outcomes",
        body: [
          "We're confident in our process, and we still won't guarantee a particular number, ranking or return. Anyone who guarantees those before seeing your system is guessing, loudly. What we commit to is the way of working described on this site: map first, build carefully, measure honestly, improve continuously.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "The website is provided as is, and we're not liable for indirect losses connected to reading it. For project work, liability is defined fairly in the project agreement, in proportion to what we actually control.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "If we change these terms, we'll update the year at the top of this page. Material changes that affect your account will be communicated directly, not buried here.",
        ],
      },
    ],
  },
];

export function getLegal(slug: string): LegalDoc | undefined {
  return LEGAL.find((d) => d.slug === slug);
}
