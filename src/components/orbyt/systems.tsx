"use client";

import { SYSTEM_BLUEPRINTS, SYSTEMS_SECTION } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Systems() {
  return (
    <Section
      id="systems"
      eyebrow={SYSTEMS_SECTION.eyebrow}
      title={SYSTEMS_SECTION.title}
      lede={SYSTEMS_SECTION.lede}
    >
      <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3">
        {SYSTEM_BLUEPRINTS.map((system, i) => (
          <Reveal key={system.id} delay={i * 0.06} className="h-full">
            <div className="flex h-full flex-col border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-pixel-orange">
              <p className="font-mono text-[11px] tracking-[0.18em] text-primary">
                {`SYSTEM / ${String(i + 1).padStart(2, "0")}`}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {system.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {system.for}
              </p>

              <div className="my-5 border-t border-border" aria-hidden="true" />

              <ul className="space-y-2.5">
                {system.components.map((component) => (
                  <li
                    key={component}
                    className="flex items-start gap-3 text-sm leading-relaxed"
                  >
                    <span
                      className="mt-[7px] size-1.5 shrink-0 bg-primary"
                      aria-hidden="true"
                    />
                    <span>{component}</span>
                  </li>
                ))}
              </ul>

              <div className="my-5 border-t border-border" aria-hidden="true" />

              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {SYSTEMS_SECTION.measuredLabel}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {system.measured.map((metric) => (
                  <span
                    key={metric}
                    className="border border-border px-2.5 py-1 font-mono text-xs text-foreground/80"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
