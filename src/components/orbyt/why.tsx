"use client";

import { Fragment } from "react";
import { PRINCIPLES, WHY_SECTION } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";

const INTERSECTIONS = ["TECHNOLOGY", "MARKETING", "OPERATIONS"] as const;

export function Why() {
  return (
    <Section
      id="why"
      eyebrow={WHY_SECTION.eyebrow}
      title={WHY_SECTION.title}
      lede={WHY_SECTION.lede}
    >
      {/* Principles */}
      <div className="mt-12 border-b border-border md:mt-16">
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {PRINCIPLES.map((principle, i) => (
            <Reveal key={principle.title} delay={(i % 2) * 0.05}>
              <div className="flex gap-4 border-t border-border py-6 sm:gap-6">
                <span className="shrink-0 pt-1 font-mono text-xs text-primary">
                  {`P-${String(i + 1).padStart(2, "0")}`}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {principle.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* About — the intersection */}
      <Reveal className="mt-12">
        <div className="border-l-2 border-primary pl-6">
          <p className="max-w-3xl text-lg leading-relaxed md:text-xl">
            {WHY_SECTION.about}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {INTERSECTIONS.map((word, i) => (
              <Fragment key={word}>
                {i > 0 ? (
                  <span
                    className="font-mono text-sm text-primary"
                    aria-hidden="true"
                  >
                    +
                  </span>
                ) : null}
                <span className="border border-border px-3 py-1.5 font-mono text-xs tracking-[0.18em]">
                  {word}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
