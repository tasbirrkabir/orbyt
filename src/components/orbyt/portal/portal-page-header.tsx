"use client";

import { Reveal } from "@/components/orbyt/reveal";

/**
 * Shared header for the portal's sub-rooms: mono eyebrow, display title,
 * one honest sentence of context. The overview keeps its own bigger
 * greeting; every other room uses this.
 */
export function PortalPageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <Reveal>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {sub}
      </p>
    </Reveal>
  );
}
