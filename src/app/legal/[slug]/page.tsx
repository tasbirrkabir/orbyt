import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL, getLegal } from "@/content/legal";
import { SiteShell } from "@/components/orbyt/site-shell";
import { LegalView } from "@/components/orbyt/views/legal-view";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegal(slug);
  if (!doc) {
    return { title: "ORBYT" };
  }
  return {
    title: `ORBYT: ${doc.title}`,
    description: doc.intro,
    openGraph: {
      title: `ORBYT: ${doc.title}`,
      description: doc.intro,
      siteName: "ORBYT",
      type: "website",
    },
  };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const doc = getLegal(slug);
  if (!doc) notFound();

  return (
    <SiteShell>
      <LegalView doc={doc} />
    </SiteShell>
  );
}
