import type { Metadata } from "next";
import { CONTACT } from "@/content/orbyt";
import { SiteShell } from "@/components/orbyt/site-shell";
import { PageHero } from "@/components/orbyt/page-hero";
import { ContactFlow } from "@/components/orbyt/contact-flow";
import { BreadcrumbsJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Contact ORBYT ONWARD | Project Inquiry & Consultation",
  description:
    "Start a technical inquiry with ORBYT ONWARD. Discuss your custom software, web application, SaaS, or AI automation project with our engineering team in Bangladesh.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact ORBYT ONWARD | Project Inquiry & Consultation",
    description:
      "Start a technical inquiry with ORBYT ONWARD. Discuss your custom software, web application, SaaS, or AI automation project with our engineering team in Bangladesh.",
    url: "https://orbytonward.tech/contact",
    siteName: "ORBYT ONWARD",
    type: "website",
  },
};

export default function ContactPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ];

  return (
    <SiteShell>
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <main className="flex-1">
        <PageHero
          id="contact"
          eyebrow={CONTACT.eyebrow}
          title={CONTACT.title}
          lede={CONTACT.sub}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <ContactFlow />
        </div>
      </main>
    </SiteShell>
  );
}
