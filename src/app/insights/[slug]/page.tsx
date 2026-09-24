import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ESSAYS, getEssay } from "@/content/insights";
import { SiteShell } from "@/components/orbyt/site-shell";
import { EssayView } from "@/components/orbyt/views/essay-view";

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
    return { title: "ORBYT: Insights" };
  }
  return {
    title: essay.title,
    description: essay.dek,
    openGraph: {
      title: essay.title,
      description: essay.dek,
      siteName: "ORBYT",
      type: "article",
    },
  };
}

export default async function EssayPage({ params }: Params) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  const index = ESSAYS.findIndex((e) => e.slug === essay.slug);
  const nextEssay = ESSAYS[(index + 1) % ESSAYS.length];

  return (
    <SiteShell>
      <EssayView essay={essay} nextEssay={nextEssay} />
    </SiteShell>
  );
}
