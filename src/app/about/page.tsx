import type { Metadata } from "next";
import { WHY_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { AboutView } from "@/components/orbyt/views/about-view";

export const metadata: Metadata = {
  title: "ORBYT: About",
  description: WHY_SECTION.about,
  openGraph: {
    title: "ORBYT: About",
    description: WHY_SECTION.about,
    siteName: "ORBYT",
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
