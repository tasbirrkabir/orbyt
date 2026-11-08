import type { Metadata } from "next";
import { TEAM } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { TeamView } from "@/components/orbyt/views/team-view";

export const metadata: Metadata = {
  title: "Engineering Team & Leadership | ORBYT ONWARD",
  description:
    "Meet the systems architects, software engineers, and digital systems specialists at ORBYT ONWARD led by Founder & Lead Systems Architect Tasbir Kabir in Bangladesh.",
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: "Engineering Team & Leadership | ORBYT ONWARD",
    description:
      "Meet the systems architects, software engineers, and digital systems specialists at ORBYT ONWARD led by Founder & Lead Systems Architect Tasbir Kabir in Bangladesh.",
    url: "https://orbytonward.tech/team",
    siteName: "ORBYT ONWARD",
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
