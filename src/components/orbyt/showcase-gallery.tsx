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

/* The brand plates — the practice as a system, not a place. */
const ROW_A: Tile[] = [
  { src: "/images/brand/beacon.jpg", label: "THE BEACON", sub: "Build the thing people gather around", aspect: "aspect-[4/5]", width: 340, height: 425 },
  { src: "/images/brand/posters.jpg", label: "THE BLUEPRINT", sub: "Every surface on the same grid", aspect: "aspect-[4/3]", width: 460, height: 345 },
  { src: "/images/brand/control.jpg", label: "THE CRAFT", sub: "Hands on the keys, eyes on the data", aspect: "aspect-square", width: 380, height: 380 },
  { src: "/images/brand/keycaps.jpg", label: "THE MANTRA", sub: "Don't give up. Do it. Ship.", aspect: "aspect-square", width: 380, height: 380 },
];

const ROW_B: Tile[] = [
  { src: "/images/brand/skyline.jpg", label: "THE AMBITION", sub: "Growth you can look up at", aspect: "aspect-[3/4]", width: 360, height: 480 },
  { src: "/images/brand/ember.jpg", label: "THE MOMENTUM", sub: "Motion that keeps its heat", aspect: "aspect-[3/4]", width: 360, height: 480 },
  { src: "/images/brand/invite.jpg", label: "THE INVITE", sub: "The letter that starts the project", aspect: "aspect-square", width: 380, height: 380 },
  { src: "/images/brand/signal-lost.jpg", label: "THE GUARDRAIL", sub: "Nothing stays lost. Not even 404s.", aspect: "aspect-square", width: 380, height: 380 },
];

function GalleryTile({ tile }: { tile: Tile }) {
  return (
    <TiltCard
      max={5}
      className="group mr-4 shrink-0"
    >
      <figure
        className={cn(
          "tint-sweep relative overflow-hidden border border-border bg-card transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_36px_rgba(253,90,1,0.14)]",
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
 * ShowcaseGallery — a full-bleed, dual-direction marquee of the brand
 * plates: the practice drawn as the system it is. ORBYT is a distributed
 * crew with no office, so there is nothing to photograph — the plates
 * stand in honestly, labelled with what the work actually does.
 * Rows pause on hover; edges fade via mask; tiles tilt in 3D.
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
            The practice, drawn
          </p>
          <h2
            id="showcase-heading"
            className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl"
          >
            The work,{" "}
            <span className="text-primary">in motion.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            No office tour — there is no office. ORBYT runs as a distributed
            crew, so here is the practice the honest way: as a system.
          </p>
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
