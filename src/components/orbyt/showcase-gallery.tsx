"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SYSTEMS_SECTION } from "@/content/orbyt";
import { Marquee } from "./marquee";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { cn } from "@/lib/utils";

type Tile = {
  src: string;
  label: string;
  /** Tailwind aspect class. */
  aspect: string;
  width: number;
  height: number;
};

const ROW_A: Tile[] = [
  { src: "/images/showcase/showcase-01.png", label: "DASHBOARDS THAT BREATHE", aspect: "aspect-square", width: 560, height: 560 },
  { src: "/images/showcase/showcase-03.png", label: "THE CONNECTED MESH", aspect: "aspect-[16/10]", width: 760, height: 475 },
  { src: "/images/showcase/showcase-02.png", label: "DATA IN MOTION", aspect: "aspect-[3/4]", width: 400, height: 533 },
  { src: "/images/showcase/showcase-05.png", label: "PIXELS, ENGINEERED", aspect: "aspect-[16/10]", width: 760, height: 475 },
];

const ROW_B: Tile[] = [
  { src: "/images/showcase/showcase-06.png", label: "THE AI CORE", aspect: "aspect-square", width: 560, height: 560 },
  { src: "/images/showcase/showcase-07.png", label: "AUTOMATION FLOW", aspect: "aspect-[16/10]", width: 760, height: 475 },
  { src: "/images/showcase/showcase-04.png", label: "ORBITAL SYSTEMS", aspect: "aspect-square", width: 560, height: 560 },
  { src: "/images/showcase/showcase-08.png", label: "BUILT TO RUN", aspect: "aspect-[3/4]", width: 400, height: 533 },
];

function GalleryTile({ tile }: { tile: Tile }) {
  return (
    <figure
      className={cn(
        "group relative mr-4 shrink-0 overflow-hidden border border-border bg-card transition-colors duration-300 hover:border-primary/60",
        tile.aspect
      )}
      style={{ width: tile.width }}
    >
      <Image
        src={tile.src}
        alt={tile.label}
        fill
        sizes="560px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
      />
      <figcaption className="absolute bottom-3 left-3 right-3 translate-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-primary">
        {tile.label}
      </figcaption>
    </figure>
  );
}

/**
 * ShowcaseGallery — a full-bleed, dual-direction image marquee of the
 * systems ORBYT builds, rendered in the brand's ink-and-ember language.
 * Rows pause on hover; edges fade via mask. Visualizations of systems,
 * not invented case studies (honesty rule holds).
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
            The work, rendered
          </p>
          <h2
            id="showcase-heading"
            className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl"
          >
            Systems with a
            <span className="text-primary"> pulse.</span>
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
          <Marquee duration={52} pauseOnHover>
            <div className="flex items-stretch py-1">
              {ROW_A.map((tile) => (
                <GalleryTile key={tile.src} tile={tile} />
              ))}
            </div>
          </Marquee>
          <Marquee duration={58} reverse pauseOnHover>
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
