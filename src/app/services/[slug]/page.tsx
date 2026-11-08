import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/orbyt/site-shell";
import { ServiceDetailView } from "@/components/orbyt/views/service-detail-view";
import { BreadcrumbsJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { DETAILED_SERVICES, getServiceBySlug } from "@/content/services-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DETAILED_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | ORBYT ONWARD",
    };
  }

  const title = `${service.title} | ORBYT ONWARD`;
  const description = service.short;
  const canonicalUrl = `/services/${service.slug}`;
  const imageUrl = service.image.startsWith("http")
    ? service.image
    : `https://orbytonward.tech${service.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `https://orbytonward.tech/services/${service.slug}`,
      siteName: "ORBYT ONWARD",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${service.title} — ORBYT ONWARD`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.title, url: `/services/${service.slug}` },
  ];

  return (
    <SiteShell>
      <ServiceJsonLd service={service} />
      <BreadcrumbsJsonLd items={breadcrumbs} />
      {service.faqs && service.faqs.length > 0 && <FaqJsonLd faqs={service.faqs} />}
      <ServiceDetailView service={service} />
    </SiteShell>
  );
}
