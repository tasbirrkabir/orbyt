import type { Metadata } from "next";
import { PROCESS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { ProcessView } from "@/components/orbyt/views/process-view";

export const metadata: Metadata = {
  title: "Engineering Process | ORBYT ONWARD — Discovery, Architecture, Build & Scale",
  description:
    "How ORBYT ONWARD designs and builds connected software systems: Discovery, Architecture, Build, Connect, and Scale. Rigorous sprints with measurable verification.",
  alternates: {
    canonical: "/process",
  },
  openGraph: {
    title: "Engineering Process | ORBYT ONWARD — Discovery, Architecture, Build & Scale",
    description:
      "How ORBYT ONWARD designs and builds connected software systems: Discovery, Architecture, Build, Connect, and Scale.",
    url: "https://orbytonward.tech/process",
    siteName: "ORBYT ONWARD",
    type: "website",
  },
};

export default function ProcessPage() {
  return (
    <SiteShell>
      <ProcessView />
    </SiteShell>
  );
}
