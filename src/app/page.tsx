import type { Metadata } from "next";
import { HERO, SITE } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { HomeView } from "@/components/orbyt/views/home-view";

export const metadata: Metadata = {
  title: "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
  description:
    "ORBYT ONWARD is a Bangladesh-based software development and digital systems company building custom software, web applications, SaaS platforms, AI automation, and connected digital growth systems.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
    description:
      "ORBYT ONWARD builds connected digital systems by combining software engineering, AI, automation, marketing, and creative execution.",
    url: "https://orbytonward.tech",
    siteName: "ORBYT ONWARD",
    type: "website",
    images: [
      {
        url: "/images/art/sadias-ielts-showcase.png",
        width: 2048,
        height: 1536,
        alt: "ORBYT ONWARD — Software Development & Digital Systems Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORBYT ONWARD | Software Development & AI Solutions Company in Bangladesh",
    description:
      "ORBYT ONWARD builds connected digital systems by combining software engineering, AI, automation, marketing, and creative execution.",
    images: ["/images/art/sadias-ielts-showcase.png"],
  },
};

export default function HomePage() {
  return (
    <SiteShell>
      <HomeView />
    </SiteShell>
  );
}
