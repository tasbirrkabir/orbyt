import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ESSAYS, getEssay } from "@/content/insights";
import { SiteShell } from "@/components/orbyt/site-shell";
import { EssayView } from "@/components/orbyt/views/essay-view";
import { ArticleJsonLd, BreadcrumbsJsonLd } from "@/components/seo/json-ld";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ESSAYS.map((essay) => ({ slug: essay.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) {
    return { title: "Insight Not Found | ORBYT ONWARD" };
  }
  const title = `${essay.title} | ORBYT ONWARD`;
  return {
    title,
    description: essay.dek,
    alternates: {
      canonical: `/insights/${essay.slug}`,
    },
    openGraph: {
      title,
      description: essay.dek,
      url: `https://orbytonward.tech/insights/${essay.slug}`,
      siteName: "ORBYT ONWARD",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: essay.dek,
    },
  };
}

export default async function EssayPage({ params }: Params) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  const index = ESSAYS.findIndex((e) => e.slug === essay.slug);
  const nextEssay = ESSAYS[(index + 1) % ESSAYS.length];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Insights", url: "/insights" },
    { name: essay.title, url: `/insights/${essay.slug}` },
  ];

  return (
    <SiteShell>
      <ArticleJsonLd
        title={essay.title}
        description={essay.dek}
        url={`https://orbytonward.tech/insights/${essay.slug}`}
        authorName="Tasbir Kabir"
        datePublished="2025-01-15T00:00:00+06:00"
        dateModified="2026-11-01T00:00:00+06:00"
      />
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <EssayView essay={essay} nextEssay={nextEssay} />
    </SiteShell>
  );
}
