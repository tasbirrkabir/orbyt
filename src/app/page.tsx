import type { Metadata } from "next";
import { HERO, SITE } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { HomeView } from "@/components/orbyt/views/home-view";

export const metadata: Metadata = {
  title: "ORBYT: Digital systems built for growth",
  description: HERO.sub,
  openGraph: {
    title: "ORBYT: Digital systems built for growth",
    description: SITE.tagline,
    siteName: "ORBYT",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <SiteShell>
      <HomeView />
    </SiteShell>
  );
}
