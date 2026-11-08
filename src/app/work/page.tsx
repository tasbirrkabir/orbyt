import type { Metadata } from "next";
import { SYSTEMS_SECTION } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { WorkView } from "@/components/orbyt/views/work-view";

export const metadata: Metadata = {
  title: "Work & Case Studies | ORBYT ONWARD — Software Systems in Production",
  description:
    "Explore real software deployments, web applications, and digital growth systems engineered by ORBYT ONWARD in Bangladesh. Featuring Sadia's IELTS Academy and client architectures.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work & Case Studies | ORBYT ONWARD — Software Systems in Production",
    description:
      "Explore real software deployments, web applications, and digital growth systems engineered by ORBYT ONWARD in Bangladesh. Featuring Sadia's IELTS Academy.",
    url: "https://orbytonward.tech/work",
    siteName: "ORBYT ONWARD",
    type: "website",
    images: [
      {
        url: "https://orbytonward.tech/images/art/sadias-ielts-showcase.png",
        width: 1200,
        height: 630,
        alt: "Sadia's IELTS Academy Case Study — ORBYT ONWARD",
      },
    ],
  },
};

export default function WorkPage() {
  return (
    <SiteShell>
      <WorkView />
    </SiteShell>
  );
}
