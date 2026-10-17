"use client";

import { CTA_STRIP } from "@/content/orbyt";
import { Marquee } from "./marquee";
import { cn } from "@/lib/utils";

/**
 * GiantMarquee — the site's loudest quiet moment: display-font words at
 * billboard scale, alternating outlined and solid, drifting in opposite
 * directions and leaning with scroll velocity. Sits between sections as
 * a breath of pure typography — no images, no CTA, just the brand voice
 * at scale. (Marquee renders the half twice for the seamless loop and
 * parks everything under reduced motion.)
 */
export function GiantMarquee() {
  const half = (
    <div className="flex items-center">
      {CTA_STRIP.map((word, i) => (
        <span key={word} className="flex items-center">
          <span
            className={cn(
              "px-6 font-display text-[19vw] font-bold leading-none tracking-tight sm:text-[15vw] lg:text-[11rem]",
              i % 2 === 0 ? "text-outline" : "text-outline-primary"
            )}
          >
            {word}
          </span>
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 bg-primary sm:size-3"
          />
        </span>
      ))}
    </div>
  );

  return (
    <section
      aria-label="Build. Connect. Grow."
      className="relative overflow-hidden border-y border-border bg-background py-2"
    >
      <div className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee duration={38} reactive>
          {half}
        </Marquee>
      </div>
      <div className="mt-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee duration={46} reverse reactive>
          {half}
        </Marquee>
      </div>
    </section>
  );
}
