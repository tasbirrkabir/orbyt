import type { Metadata } from "next";
import { PROCESS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { ProcessView } from "@/components/orbyt/views/process-view";

export const metadata: Metadata = {
  title: "ORBYT: Process",
  description: PROCESS_SECTION.lede,
  openGraph: {
    title: "ORBYT: Process",
    description: PROCESS_SECTION.lede,
    siteName: "ORBYT",
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
