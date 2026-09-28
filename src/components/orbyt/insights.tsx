"use client";

import { INSIGHTS, INSIGHTS_SECTION } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Insights() {
  return (
    <Section
      id="insights"
      eyebrow={INSIGHTS_SECTION.eyebrow}
      title={INSIGHTS_SECTION.title}
      lede={INSIGHTS_SECTION.lede}
    >
      {/* Statements, not links — no dates, no read-time, no invented metrics */}
      <div className="mt-12 border-b border-border md:mt-16">
        {INSIGHTS.map((insight, i) => (
          <Reveal key={insight.title} delay={i * 0.04}>
            <article className="group grid grid-cols-1 gap-3 border-t border-border py-8 transition-colors duration-300 hover:bg-accent/20 md:grid-cols-12 md:gap-6">
              <p className="font-mono text-sm text-muted-foreground md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary md:col-span-6 md:text-2xl">
                {insight.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:col-span-5">
                {insight.stance}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
