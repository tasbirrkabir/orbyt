import React from "react";

export const SITE_URL = "https://orbytonward.tech";
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Organization and WebSite Schema (sitewide graph)
 */
export function RootJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "ORBYT ONWARD",
        alternateName: ["ORBYT", "Orbyt Onward"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
          caption: "ORBYT ONWARD",
        },
        image: `${SITE_URL}/images/art/sadias-ielts-showcase.png`,
        description:
          "Bangladesh-based software development and digital systems company building custom software, web applications, SaaS platforms, AI automation, and connected digital growth systems.",
        foundingLocation: {
          "@type": "Country",
          name: "Bangladesh",
        },
        areaServed: [
          {
            "@type": "Country",
            name: "Bangladesh",
          },
          {
            "@type": "AdministrativeArea",
            name: "Global",
          },
        ],
        knowsAbout: [
          "Custom Software Development",
          "Web Application Development",
          "SaaS Development",
          "AI Development & Workflow Automation",
          "Performance Marketing & Media Buying",
          "Conversion Tracking & Data Architecture",
          "Digital Systems Engineering",
        ],
        sameAs: [
          "https://github.com/tasbirrkabir/orbyt",
          "https://github.com/tasbirrkabir",
        ],
        founder: {
          "@id": FOUNDER_ID,
        },
      },
      {
        "@type": "Person",
        "@id": FOUNDER_ID,
        name: "Tasbir Kabir",
        jobTitle: "Founder & Lead Systems Architect",
        worksFor: {
          "@id": ORG_ID,
        },
        url: `${SITE_URL}/team`,
        sameAs: ["https://github.com/tasbirrkabir"],
        knowsAbout: [
          "Full-Stack Software Architecture",
          "Next.js & TypeScript",
          "Cloud Infrastructure",
          "AI Automation Workflows",
          "Systems Engineering",
        ],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "ORBYT ONWARD",
        alternateName: "ORBYT",
        description:
          "Software development and digital systems company in Bangladesh.",
        publisher: {
          "@id": ORG_ID,
        },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Service Schema Component
 */
export function ServiceJsonLd(props: {
  name?: string;
  description?: string;
  url?: string;
  category?: string;
  service?: {
    title: string;
    short: string;
    slug: string;
    category: string;
  };
}) {
  const name = props.name || props.service?.title || "ORBYT ONWARD Service";
  const description = props.description || props.service?.short || "";
  const url = props.url || (props.service ? `${SITE_URL}/services/${props.service.slug}` : SITE_URL);
  const category = props.category || props.service?.category || "Software Development";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    category,
    provider: {
      "@id": ORG_ID,
    },
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    serviceType: category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Breadcrumb Schema Component
 */
export function BreadcrumbsJsonLd({ items }: { items?: BreadcrumbItem[] }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema Component
 */
export function FaqJsonLd(props: { items?: FaqItem[]; faqs?: FaqItem[] }) {
  const list = props.items || props.faqs;
  if (!list || !Array.isArray(list) || list.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Article Schema Component
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = "Tasbir Kabir",
  imageUrl,
}: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Person",
      name: authorName,
      url: `${SITE_URL}/team`,
    },
    publisher: {
      "@id": ORG_ID,
    },
    datePublished: datePublished || "2025-01-15T00:00:00+06:00",
    dateModified: dateModified || "2026-11-01T00:00:00+06:00",
    image: imageUrl || `${SITE_URL}/images/art/sadias-ielts-showcase.png`,
    inLanguage: "en",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * CreativeWork / Case Study Schema
 */
export function CaseStudyJsonLd({
  title,
  description,
  url,
  client,
  about,
  liveUrl,
  imageUrl,
}: {
  title: string;
  description: string;
  url: string;
  client: string;
  about: string;
  liveUrl?: string;
  imageUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    headline: title,
    description,
    url,
    creator: {
      "@id": ORG_ID,
    },
    provider: {
      "@id": ORG_ID,
    },
    about: {
      "@type": "Organization",
      name: client,
      url: liveUrl,
    },
    genre: "Client Case Study & Software Deployment",
    image: imageUrl || `${SITE_URL}/images/art/sadias-ielts-showcase.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
