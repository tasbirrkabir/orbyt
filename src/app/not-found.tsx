import Link from "next/link";
import Image from "next/image";
import { NOT_FOUND } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/orbyt/site-shell";
import { CrossField } from "@/components/orbyt/cross-field";

/**
 * 404: the signal-lost plate. The brand's own "not found" artwork framed
 * as a glowing artifact, mono 404, blueprint grid, straight back home.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <section
        aria-labelledby="notfound-heading"
        className="relative overflow-hidden bg-blueprint"
      >
        <CrossField />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 md:py-32">
          <figure className="group relative aspect-square w-full max-w-sm overflow-hidden border border-border bg-card shadow-pixel-orange transition-colors duration-300 hover:border-primary/60">
            <Image
              src="/images/brand/signal-lost.jpg"
              alt="Glowing orange pixel artwork of a figure falling beside the words 'not found' — the signal was lost"
              fill
              sizes="(min-width: 640px) 380px, 90vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
            />
            <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              <span>Err · Signal lost</span>
              <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
            </figcaption>
          </figure>
          <p className="mt-10 font-mono text-sm tracking-[0.3em] text-primary">
            {NOT_FOUND.code}
          </p>
          <h1
            id="notfound-heading"
            className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
          >
            {NOT_FOUND.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {NOT_FOUND.body}
          </p>
          <Button asChild className="mt-8 h-12 px-7 text-base font-semibold">
            <Link href={NOT_FOUND.cta.href}>{NOT_FOUND.cta.label}</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
