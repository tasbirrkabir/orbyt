"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SYSTEMS_SECTION } from "@/content/orbyt";
import { Marquee } from "./marquee";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { TiltCard } from "./parallax-image";
import { cn } from "@/lib/utils";

type Tile = {
  src: string;
  label: string;
  sub: string;
  /** Tailwind aspect class. */
  aspect: string;
  width: number;
  height: number;
};

const ROW_A: Tile[] = [
  { src: "/images/studio/studio-floor.jpg", label: "THE STUDIO FLOOR", sub: "Where the work happens", aspect: "aspect-[21/10]", width: 640, height: 305 },
  { src: "/images/studio/wireframe-sketch.jpg", label: "PAPER FIRST", sub: "Interfaces start on paper", aspect: "aspect-[4/3]", width: 460, height: 345 },
  { src: "/images/studio/code-screens.jpg", label: "SHIP LOGS", sub: "Real builds, real commits", aspect: "aspect-square", width: 380, height: 380 },
];

const ROW_B: Tile[] = [
  { src: "/images/studio/sprint-wall.jpg", label: "THE SPRINT WALL", sub: "Every task has an owner", aspect: "aspect-square", width: 380, height: 380 },
  { src: "/images/studio/collab-review.jpg", label: "REVIEW RITUALS", sub: "Client + builder, same table", aspect: "aspect-[4/3]", width: 460, height: 345 },
  { src: "/images/studio/keyboard-macro.jpg", label: "HANDS ON KEYS", sub: "Craft over shortcuts", aspect: "aspect-[3/4]", width: 360, height: 480 },
  { src: "/images/studio/green-studio.jpg", label: "HQ", sub: "A calm place to think", aspect: "aspect-[4/3]", width: 460, height: 345 },
];

function GalleryTile({ tile }: { tile: Tile }) {
  return (
    <TiltCard
      max={5}
      className="group mr-4 shrink-0"
    >
      <figure
        className={cn(
          "relative overflow-hidden border border-border bg-card transition-colors duration-300 group-hover:border-primary/60",
          tile.aspect
        )}
        style={{ width: tile.width }}
      >
        <Image
          src={tile.src}
          alt={`${tile.label} — ${tile.sub}`}
          fill
          sizes="560px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
        />
        <figcaption className="absolute bottom-3 left-3 right-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            {tile.label}
          </span>
          <span className="mt-0.5 block text-xs text-foreground/80">
            {tile.sub}
          </span>
        </figcaption>
      </figure>
    </TiltCard>
  );
}

/**
 * ShowcaseGallery — a full-bleed, dual-direction photo marquee of the
 * studio at work. Rows pause on hover; edges fade via mask; tiles tilt in
 * 3D under the pointer. Photographs of the practice itself — no invented
 * case studies (honesty rule holds).
 */
export function ShowcaseGallery() {
  return (
    <Section
      id="showcase"
      header={null}
      className="overflow-hidden py-16 md:py-20"
    >
      <div className="mx-auto mb-10 flex w-full max-w-6xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Reveal className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            The work, in progress
          </p>
          <h2
            id="showcase-heading"
            className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl"
          >
            Inside the
            <span className="text-primary"> studio.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="hidden shrink-0 sm:block">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
          >
            {SYSTEMS_SECTION.detailCta.label}
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <Marquee duration={48} pauseOnHover>
            <div className="flex items-stretch py-1">
              {ROW_A.map((tile) => (
                <GalleryTile key={tile.src} tile={tile} />
              ))}
            </div>
          </Marquee>
          <Marquee duration={54} reverse pauseOnHover>
            <div className="flex items-stretch py-1">
              {ROW_B.map((tile) => (
                <GalleryTile key={tile.src} tile={tile} />
              ))}
            </div>
          </Marquee>
        </div>
      </Reveal>
    </Section>
  );
}
