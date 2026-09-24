import type { Metadata } from "next";
import { INSIGHTS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { InsightsView } from "@/components/orbyt/views/insights-view";

export const metadata: Metadata = {
  title: "ORBYT: Insights",
  description: INSIGHTS_SECTION.lede,
  openGraph: {
    title: "ORBYT: Insights",
    description: INSIGHTS_SECTION.lede,
    siteName: "ORBYT",
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
