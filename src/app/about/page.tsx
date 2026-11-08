import type { Metadata } from "next";
import { WHY_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { AboutView } from "@/components/orbyt/views/about-view";

export const metadata: Metadata = {
  title: "About | ORBYT ONWARD — Software Systems Company in Bangladesh",
  description:
    "Learn about ORBYT ONWARD, a Bangladesh-based software engineering and digital systems company building connected software, web applications, SaaS, and AI automation.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | ORBYT ONWARD — Software Systems Company in Bangladesh",
    description:
      "Learn about ORBYT ONWARD, a Bangladesh-based software engineering and digital systems company building connected software, web applications, SaaS, and AI automation.",
    url: "https://orbytonward.tech/about",
    siteName: "ORBYT ONWARD",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutView />
    </SiteShell>
  );
}
