"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { HERO, HOME_TRUST, SITE } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { AnimatedMark } from "./animated-mark";
import { CrossField } from "./cross-field";
import { FadeUp } from "./reveal";
import { Magnetic } from "./magnetic";
import { Marquee } from "./marquee";
import { Scramble } from "./scramble";
import { emphasize } from "./emphasize";
import { cn } from "@/lib/utils";

const LINE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Home hero. The logo is the show: the animated mark (satellites + halo)
 * rides a dashed orbital ring above the floating tile, the headline rises
 * out of two masks, the eyebrow decodes, the primary CTA is magnetic and
 * the whole logo column drifts on scroll. Marquee 1 of 3 (hero, worked
 * with, CTA strip).
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const tileY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, -36]);

  return (
    <section
      id="top"
      ref={ref}
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
                <Scramble text={HERO.eyebrow} speed={22} />
              </p>
            </FadeUp>

            {/* Masked line reveal */}
            <h1
              id="hero-heading"
              className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="block overflow-hidden pb-1">
                {reduced ? (
                  <span className="block">
                    {emphasize(HERO.titleA, "system")}
                  </span>
                ) : (
                  <motion.span
                    className="block"
                    initial={{ y: "112%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.05, ease: LINE_EASE }}
                  >
                    {emphasize(HERO.titleA, "system")}
                  </motion.span>
                )}
              </span>
              <span className="block overflow-hidden pb-1">
                {reduced ? (
                  <span className="block">{HERO.titleB}</span>
                ) : (
                  <motion.span
                    className="block"
                    initial={{ y: "112%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.16, ease: LINE_EASE }}
                  >
                    {HERO.titleB}
                  </motion.span>
                )}
              </span>
            </h1>

            <FadeUp delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {HERO.sub}
              </p>
            </FadeUp>

            <FadeUp delay={0.18}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Magnetic strength={0.25}>
                  <Button
                    asChild
                    className="h-12 px-7 text-base font-semibold"
                  >
                    <Link href={SITE.cta.href}>
                      {SITE.cta.label}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </Magnetic>
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

          {/* Logo composition: orbital mark over the floating, drifting tile */}
          <div className="min-w-0 lg:col-span-5">
            <FadeUp
              delay={0.15}
              className="relative mx-auto w-full max-w-sm lg:max-w-none"
            >
              <motion.div
                className="mb-10 flex justify-center lg:absolute lg:-top-16 lg:right-0 lg:z-20 lg:mb-0"
                style={reduced ? undefined : { y: markY }}
              >
                <div className="relative">
                  {!reduced ? (
                    <span
                      aria-hidden="true"
                      className="animate-spin-slow absolute left-1/2 top-1/2 size-[188px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/30"
                      style={{ "--spin-duration": "36s" } as CSSProperties}
                    />
                  ) : null}
                  <AnimatedMark size={120} satellites={2} halo />
                </div>
              </motion.div>

              <motion.div
                style={reduced ? undefined : { y: tileY }}
                className="min-w-0"
              >
                <div
                  className={cn(
                    "shadow-pixel-orange",
                    !reduced && "animate-float"
                  )}
                  style={{ "--float-duration": "8s" } as CSSProperties}
                >
                  <div
                    className="overflow-hidden rounded-md border border-border transition-transform duration-300 hover:-rotate-1"
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
              </motion.div>
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
                className="group flex min-w-0 flex-col gap-1.5 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground/90">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary transition-transform duration-300 group-hover:scale-150"
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
