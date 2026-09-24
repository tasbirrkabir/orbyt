import Link from "next/link";
import { NOT_FOUND } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/orbyt/site-shell";
import { AnimatedMark } from "@/components/orbyt/animated-mark";
import { CrossField } from "@/components/orbyt/cross-field";

/**
 * 404: the mark drifting out of orbit. Big animated mark with satellites,
 * mono 404, blueprint grid, straight back to the homepage.
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
          <AnimatedMark size={112} satellites={2} halo />
          <p className="mt-12 font-mono text-sm tracking-[0.3em] text-primary">
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
