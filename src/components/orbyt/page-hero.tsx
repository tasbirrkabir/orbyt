import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmberField } from "./ember-field";
import { SplitWords } from "./split-words";

type PageHeroProps = {
  /** Anchor id; the h1 receives `${id}-heading` for aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  /** Rendered in text-primary on its own line under the title. */
  titleAccent?: string;
  lede?: string;
  /** Optional CTA row under the lede. */
  children?: ReactNode;
  className?: string;
};

/**
 * Shared interior-page hero band: blueprint grid, mono eyebrow, display h1,
 * optional lede and CTA. Closed by a hairline border so the page body reads
 * as a new plate.
 */
export function PageHero({
  id,
  eyebrow,
  title,
  titleAccent,
  lede,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative overflow-hidden border-b border-border bg-blueprint",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 select-none font-mono text-lg leading-none text-foreground/15 sm:right-10 sm:top-10"
      >
        +
      </span>
      <EmberField density={30} className="opacity-50" />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1
          id={`${id}-heading`}
          className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
        >
          <SplitWords text={title} />
          {titleAccent ? (
            <span className="block text-primary">
              <SplitWords text={titleAccent} delay={0.12} />
            </span>
          ) : null}
        </h1>
        {lede ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {lede}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
