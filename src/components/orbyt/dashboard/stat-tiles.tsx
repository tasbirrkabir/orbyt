"use client";

import { Reveal } from "@/components/orbyt/reveal";
import { SpotlightCard } from "@/components/orbyt/spotlight-card";
import { CountUp } from "./count-up";

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
  hint: string;
};

/**
 * The four workspace gauges. Numbers count up once, tiles carry the
 * cursor-tracking ember spotlight, labels come from the caller.
 */
export function StatTiles({ items }: { items: StatItem[] }) {
  return (
    <div className="mt-10 grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
      {items.map((item, index) => (
        <Reveal key={item.label} delay={0.08 * index} y={18}>
          <SpotlightCard className="h-full">
            <div className="flex h-full flex-col p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="mr-2 text-primary">0{index + 1}</span>
                {item.label}
              </p>
              <p className="mt-4 font-display text-4xl font-bold leading-none tracking-tight sm:text-[2.75rem]">
                <CountUp value={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {item.hint}
              </p>
            </div>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}
