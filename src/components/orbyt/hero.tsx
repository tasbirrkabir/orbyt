"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { HERO, HOME_TRUST, SITE } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { AnimatedMark } from "./animated-mark";
import { CrossField } from "./cross-field";
import { FadeUp } from "./reveal";
import { Marquee } from "./marquee";
import { emphasize } from "./emphasize";
import { cn } from "@/lib/utils";

/**
 * Home hero. The logo is the show: the animated mark (satellites + halo)
 * floats above the big orange tile, six blueprint crosses twinkle in the
 * background, and the pipeline marquee closes the band. Marquee 1 of 2.
 */
export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative scroll-mt-20 overflow-hidden bg-blueprint"
    >
      <CrossField />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-7">
            <FadeUp>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                {HERO.eyebrow}
              </p>
            </FadeUp>
            <FadeUp delay={0.05}>
              <h1
                id="hero-heading"
                className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
              >
                {emphasize(HERO.titleA, "system")}
                <span className="block">{HERO.titleB}</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {HERO.sub}
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button asChild className="h-12 px-7 text-base font-semibold">
                  <Link href={SITE.cta.href}>
                    {SITE.cta.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 text-base font-semibold"
                >
                  <Link href={SITE.secondaryCta.href}>
                    {SITE.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </FadeUp>
          </div>

          {/* Logo composition: orbiting mark over the floating tile */}
          <div className="min-w-0 lg:col-span-5">
            <FadeUp
              delay={0.15}
              className="relative mx-auto w-full max-w-sm lg:max-w-none"
            >
              <div className="mb-10 flex justify-center lg:absolute lg:-top-16 lg:right-0 lg:z-20 lg:mb-0">
                <AnimatedMark size={120} satellites={2} halo />
              </div>
              <div
                className={cn("shadow-pixel-orange", !reduced && "animate-float")}
                style={{ "--float-duration": "8s" } as CSSProperties}
              >
                <div
                  className="overflow-hidden rounded-md border border-border"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
                  }}
                >
                  <Image
                    src="/orbyt-logo.png"
                    alt="ORBYT logo: a black pixel runner on an orange tile"
                    width={1189}
                    height={1323}
                    priority
                    sizes="(min-width: 1024px) 440px, (min-width: 640px) 384px, calc(100vw - 32px)"
                    className="h-auto w-full"
                  />
                </div>
              </div>
              <p className="mt-5 text-center font-mono text-xs tracking-widest text-muted-foreground">
                BUILD · CONNECT · GROW
              </p>
            </FadeUp>
          </div>
        </div>

        {/* Trust row: the one honest promise, three mono columns */}
        <FadeUp delay={0.2} className="mt-16">
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HOME_TRUST.items.map((item) => (
              <div
                key={item.k}
                className="flex min-w-0 flex-col gap-1.5 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground/90">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  {item.k}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.v}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>

      {/* Pipeline strip: closes the hero */}
      <div className="border-y border-border">
        <Marquee duration={40} className="py-4">
          <div className="flex items-center">
            {HERO.marquee.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-6 font-mono text-sm uppercase tracking-[0.18em] text-foreground/70">
                  {item}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  );
}
