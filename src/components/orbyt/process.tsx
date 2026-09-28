"use client";

import { PROCESS_SECTION, PROCESS_STEPS } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Process() {
  return (
    <Section
      id="process"
      eyebrow={PROCESS_SECTION.eyebrow}
      title={PROCESS_SECTION.title}
      lede={PROCESS_SECTION.lede}
    >
      <div className="relative mt-12 md:mt-16">
        {/* Horizontal connector behind the step dots (xl only) */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[5px] hidden h-px bg-border xl:block"
        />
        <ol className="relative grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-6 xl:gap-x-6">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.step}
              delay={i * 0.05}
              className="relative border-l border-border pb-10 pl-6 last:pb-0 xl:border-l-0 xl:pb-0 xl:pl-0"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-1 block size-2.5 bg-primary xl:static xl:mb-4"
              />
              <p className="font-mono text-xs tracking-[0.18em] text-primary">
                {step.step}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wide">
                {step.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {step.what}
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-primary">→ OUTPUT:</span> {step.output}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
