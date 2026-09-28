"use client";

import { PROBLEM } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { emphasize } from "./emphasize";

export function Problem() {
  return (
    <Section
      id="problem"
      eyebrow={PROBLEM.eyebrow}
      title={PROBLEM.title}
      titleAccent={PROBLEM.titleAccent}
      lede={PROBLEM.lede}
    >
      {/* Six fragments — dashed borders read as broken connections */}
      <div className="mt-12 border-b border-dashed border-border md:mt-16">
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {PROBLEM.items.map((item, i) => (
            <Reveal key={item.fragment} delay={(i % 2) * 0.06}>
              <div className="flex gap-4 border-t border-dashed border-border py-6 sm:gap-6">
                <span className="shrink-0 pt-1 font-mono text-xs text-primary">
                  {`F-${String(i + 1).padStart(2, "0")}`}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {item.fragment}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Positioning statement */}
      <Reveal className="mt-12">
        <div className="border border-border bg-card p-6 shadow-pixel-orange md:p-8">
          <p className="font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
            {PROBLEM.position}
            <span className="mt-2 block">
              {emphasize(PROBLEM.positionAccent, "connects")}
            </span>
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
