import type { Metadata } from "next";
import { TEAM } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { TeamView } from "@/components/orbyt/views/team-view";

export const metadata: Metadata = {
  title: "ORBYT: Team",
  description: TEAM.lede,
  openGraph: {
    title: "ORBYT: Team",
    description: TEAM.lede,
    siteName: "ORBYT",
    type: "website",
  },
};

export default function TeamPage() {
  return (
    <SiteShell>
      <TeamView />
    </SiteShell>
  );
}
