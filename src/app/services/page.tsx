import type { Metadata } from "next";
import { SERVICES_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { ServicesView } from "@/components/orbyt/views/services-view";

export const metadata: Metadata = {
  title: "ORBYT: Services",
  description: SERVICES_SECTION.lede,
  openGraph: {
    title: "ORBYT: Services",
    description: SERVICES_SECTION.lede,
    siteName: "ORBYT",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <SiteShell>
      <ServicesView />
    </SiteShell>
  );
}
