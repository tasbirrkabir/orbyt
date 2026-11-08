import type { Metadata } from "next";
import { INSIGHTS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { InsightsView } from "@/components/orbyt/views/insights-view";

export const metadata: Metadata = {
  title: "Insights & Technical Perspectives | ORBYT ONWARD",
  description:
    "Engineering essays and systems thinking from ORBYT ONWARD: custom software, web architecture, AI automation, and performance measurement in Bangladesh.",
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    title: "Insights & Technical Perspectives | ORBYT ONWARD",
    description:
      "Engineering essays and systems thinking from ORBYT ONWARD: custom software, web architecture, AI automation, and performance measurement.",
    url: "https://orbytonward.tech/insights",
    siteName: "ORBYT ONWARD",
    type: "website",
  },
};

export default function InsightsPage() {
  return (
    <SiteShell>
      <InsightsView />
    </SiteShell>
  );
}
