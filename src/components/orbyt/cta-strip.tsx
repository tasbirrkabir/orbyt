"use client";

import { CTA_STRIP } from "@/content/orbyt";
import { Marquee } from "./marquee";

/**
 * The one full-bleed orange band: the site's loudest moment
 * and the second of exactly two allowed marquees.
 */
export function CtaStrip() {
  return (
    <section
      aria-label="Build. Connect. Grow."
      className="relative overflow-hidden border-y border-primary bg-primary text-primary-foreground"
    >
      <Marquee duration={24} reactive className="py-5">
        <div className="flex items-center">
          {CTA_STRIP.map((word) => (
            <span key={word} className="flex items-center">
              <span className="px-5 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {word}
              </span>
              <span
                className="text-2xl font-bold text-primary-foreground/70 md:text-3xl"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          ))}
        </div>
      </Marquee>
    </section>
  );
}
