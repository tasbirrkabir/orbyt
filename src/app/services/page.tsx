import type { Metadata } from "next";
import { SERVICES_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { ServicesView } from "@/components/orbyt/views/services-view";

export const metadata: Metadata = {
  title: "Services | ORBYT ONWARD — Software, Web Apps & AI Systems",
  description:
    "Explore ORBYT ONWARD's digital systems services: custom software development, web applications, SaaS platforms, AI automation, performance marketing, and creative video production in Bangladesh.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | ORBYT ONWARD — Software, Web Apps & AI Systems",
    description:
      "Explore ORBYT ONWARD's digital systems services: custom software development, web applications, SaaS platforms, AI automation, performance marketing, and creative video production.",
    url: "https://orbytonward.tech/services",
    siteName: "ORBYT ONWARD",
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
