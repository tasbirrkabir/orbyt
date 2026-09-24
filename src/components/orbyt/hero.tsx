"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HERO } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { FadeUp } from "./reveal";
import { Marquee } from "./marquee";
import { emphasize } from "./emphasize";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative scroll-mt-20 overflow-hidden bg-blueprint"
    >
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl items-center px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Copy */}
          <div className="lg:col-span-7">
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
                  <a href={HERO.primaryCta.href}>
                    {HERO.primaryCta.label}
                    <ArrowRight aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 text-base font-semibold"
                >
                  <a href={HERO.secondaryCta.href}>{HERO.secondaryCta.label}</a>
                </Button>
              </div>
            </FadeUp>
          </div>

          {/* Logo tile — one clipped corner, hard offset shadow */}
          <div className="lg:col-span-5">
            <FadeUp delay={0.1} className="mx-auto w-full sm:max-w-sm lg:max-w-none">
              <div className="shadow-pixel-orange">
                <div
                  className="overflow-hidden rounded-md border border-border"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
                  }}
                >
                  <Image
                    src="/orbyt-logo.png"
                    alt="ORBYT logo — a black pixel runner on an orange tile"
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
      </div>

      {/* Pipeline strip — closes the hero */}
      <div className="border-y border-border">
        <Marquee duration={40} className="py-4">
          <div className="flex items-center">
            {HERO.marquee.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-6 font-mono text-sm uppercase tracking-[0.18em] text-foreground/70">
                  {item}
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </span>
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  );
}
