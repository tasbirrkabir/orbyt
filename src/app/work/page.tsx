import type { Metadata } from "next";
import { SYSTEMS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { WorkView } from "@/components/orbyt/views/work-view";

export const metadata: Metadata = {
  title: "ORBYT: Work",
  description: SYSTEMS_SECTION.lede,
  openGraph: {
    title: "ORBYT: Work",
    description: SYSTEMS_SECTION.lede,
    siteName: "ORBYT",
    type: "website",
  },
};

export default function WorkPage() {
  return (
    <SiteShell>
      <WorkView />
    </SiteShell>
  );
}
