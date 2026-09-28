"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PORTAL } from "@/content/flows";
import { SpotlightCard } from "@/components/orbyt/spotlight-card";
import { Reveal } from "@/components/orbyt/reveal";

const COPY = PORTAL.overview.quick;

/**
 * The five rooms behind the overview, as one grid of doors. Each card
 * answers "what will I find in there" in a single sentence, so the portal
 * reads like a floor plan instead of a settings menu.
 */
export function QuickLinks() {
  const reduced = useReducedMotion();

  const rooms = [
    { ...PORTAL.nav.project, ...COPY.items.project },
    { ...PORTAL.nav.deliverables, ...COPY.items.deliverables },
    { ...PORTAL.nav.messages, ...COPY.items.messages },
    { ...PORTAL.nav.support, ...COPY.items.support },
    { ...PORTAL.nav.profile, ...COPY.items.profile },
  ];

  return (
    <section aria-label={COPY.label} className="mt-10">
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.label}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {COPY.sub}
          </p>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <Reveal key={room.href} delay={0.06 * index} y={16}>
            <SpotlightCard className="h-full">
              <Link
                href={room.href}
                className="group flex h-full flex-col p-4 transition-colors sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="mr-2 text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {room.title}
                  </p>
                  <motion.span
                    aria-hidden="true"
                    className="text-muted-foreground transition-colors group-hover:text-primary"
                    whileHover={reduced ? undefined : { x: 2, y: -2 }}
                  >
                    <ArrowUpRight className="size-4" />
                  </motion.span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {room.desc}
                </p>
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
