import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WORKED_WITH } from "@/content/orbyt";
import { Marquee } from "./marquee";
import { Reveal } from "./reveal";
import { Scramble } from "./scramble";

/**
 * Worked With. The honest version of a logo wall: no invented clients,
 * just the real platforms the crew wires together every week. Two
 * counter-scrolling rows, hover pauses the row you are reading.
 */
export function WorkedWith() {
  return (
    <section
      id="worked-with"
      aria-labelledby="worked-with-heading"
      className="scroll-mt-20 border-y border-border bg-card/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 md:pt-20 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              <Scramble text={WORKED_WITH.eyebrow} />
            </p>
            <h2
              id="worked-with-heading"
              className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl"
            >
              {WORKED_WITH.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {WORKED_WITH.lede}
            </p>
          </Reveal>
          <Reveal delay={0.08} className="shrink-0">
            <Link
              href={WORKED_WITH.detailCta.href}
              className="group inline-flex h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              {WORKED_WITH.detailCta.label}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* The stack, two directions, edge-faded */}
      <Reveal delay={0.1} className="mt-10">
        <div className="space-y-1 border-t border-border py-8">
          <Marquee duration={46} pauseOnHover className="mask-fade-x">
            {WORKED_WITH.rows[0].map((tool) => (
              <ToolChip key={tool} label={tool} />
            ))}
          </Marquee>
          <Marquee duration={54} reverse pauseOnHover className="mask-fade-x">
            {WORKED_WITH.rows[1].map((tool) => (
              <ToolChip key={tool} label={tool} />
            ))}
          </Marquee>
        </div>
      </Reveal>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <Reveal delay={0.12}>
          <p className="text-left font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/70 md:text-right">
            {WORKED_WITH.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ToolChip({ label }: { label: string }) {
  return (
    <span className="flex items-center">
      <span className="cursor-default px-6 font-mono text-sm uppercase tracking-[0.2em] text-foreground/45 transition-colors duration-200 hover:text-primary">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-sm text-primary/40"
      >
        +
      </span>
    </span>
  );
}
