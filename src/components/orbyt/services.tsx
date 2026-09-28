"use client";

import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { CHAIN_NODES, SERVICES, SERVICES_SECTION } from "@/content/orbyt";
import { cn } from "@/lib/utils";
import { Section } from "./section";
import { Reveal } from "./reveal";

export function Services() {
  const lastNode = CHAIN_NODES.length - 1;

  return (
    <Section
      id="services"
      eyebrow={SERVICES_SECTION.eyebrow}
      title={SERVICES_SECTION.title}
      titleAccent={SERVICES_SECTION.titleAccent}
      lede={SERVICES_SECTION.lede}
    >
      {/* Five capability groups as editorial rows, not cards */}
      <div className="mt-12 border-b border-border md:mt-16">
        {SERVICES.map((service, i) => (
          <Reveal key={service.id} delay={Math.min(i * 0.04, 0.16)}>
            <article className="grid grid-cols-1 gap-6 border-t border-border py-8 transition-colors duration-300 hover:bg-accent/30 lg:grid-cols-12">
              <div className="lg:col-span-1">
                <span className="font-mono text-sm text-primary">
                  {service.index}
                </span>
              </div>

              <div className="lg:col-span-4">
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {service.what}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-primary">
                    {"WHY — "}
                  </span>
                  {service.why}
                </p>
              </div>

              <ul className="space-y-2.5 lg:col-span-5">
                {service.builds.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span
                      className="mt-[7px] size-1.5 shrink-0 bg-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 lg:col-span-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Connects
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                    {service.connects}
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Outcome
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                    {service.outcome}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* The ORBYT chain — how the pieces connect */}
      <Reveal className="mt-12">
        <div className="border border-border bg-card/50 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            The ORBYT chain
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {SERVICES_SECTION.chainCaption}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {CHAIN_NODES.map((node, i) => (
              <Fragment key={node}>
                {i > 0 ? (
                  <ArrowRight
                    className="size-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={cn(
                    "border px-3 py-2 font-mono text-xs tracking-wider",
                    i === lastNode
                      ? "border-transparent bg-primary font-semibold text-primary-foreground"
                      : "border-border bg-card"
                  )}
                >
                  {node}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
