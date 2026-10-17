import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NOT_FOUND } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/orbyt/site-shell";
import { CrossField } from "@/components/orbyt/cross-field";
import { PixelSign404 } from "@/components/orbyt/pixel-sign-404";
import { PressAnyKey } from "@/components/orbyt/press-any-key";

/**
 * 404 — the signal-lost plate, rebuilt in code. The sign is a live
 * dot-matrix render (no image), and a mechanical keycap waits for
 * any key to snap you back to orbit.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <section
        aria-labelledby="notfound-heading"
        className="relative overflow-hidden bg-blueprint"
      >
        <CrossField />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-28">
          <p className="font-mono text-sm tracking-[0.3em] text-primary">
            {NOT_FOUND.code} · ERR
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

          {/* The rebuilt sign: computed dots, faulty-neon flicker, embers */}
          <div className="relative mt-12 w-full max-w-2xl overflow-hidden border border-border bg-[#0b0908] shadow-pixel-orange">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_90%_at_50%_8%,rgba(253,90,1,0.13),transparent_58%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(90%_70%_at_50%_105%,rgba(0,0,0,0.5),transparent_55%)]"
            />
            <div className="relative h-[240px] sm:h-[300px] md:h-[340px]">
              <PixelSign404 />
            </div>
            <div className="relative flex items-center justify-between border-t border-border/70 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              <span>{NOT_FOUND.signCaption}</span>
              <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
            </div>
          </div>

          {/* The rebuilt key: press anything, go home */}
          <div className="mt-14">
            <PressAnyKey hint={NOT_FOUND.keyHint} alt={NOT_FOUND.keyAlt} href={NOT_FOUND.cta.href} />
          </div>

          <Button
            asChild
            variant="link"
            className="mt-8 h-auto p-0 font-mono text-xs uppercase tracking-[0.22em]"
          >
            <Link href={NOT_FOUND.cta.href}>
              {NOT_FOUND.cta.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
