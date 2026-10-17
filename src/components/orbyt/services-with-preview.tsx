"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { SERVICES } from "@/content/orbyt";
import { cn } from "@/lib/utils";

/** Service → visual mapping (reuses the showcase render set). */
const SERVICE_IMAGES: Record<string, string> = {
  "ai-automation": "/images/showcase/showcase-06.png",
  "web-digital": "/images/showcase/showcase-01.png",
  "growth-marketing": "/images/showcase/showcase-03.png",
  "data-tracking": "/images/showcase/showcase-02.png",
  "digital-systems": "/images/showcase/showcase-07.png",
};

/**
 * ServicesWithPreview — the services index rows. On pointer-fine devices,
 * a floating image preview trails the cursor while a row is hovered,
 * spring-damped, cross-fading between services. Touch devices: rows only.
 */
const FINE_QUERY = "(pointer: fine)";

/** Pointer-fine media query as an external store (SSR: false). */
function subscribeFinePointer(cb: () => void) {
  const mq = window.matchMedia(FINE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function ServicesWithPreview() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_QUERY).matches,
    () => false
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });

  const showPreview = finePointer && !reduced && active !== null;

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        if (!showPreview) return;
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
    >
      <div className="border-b border-border">
        {SERVICES.map((service, i) => (
          <Link
            key={service.slug}
            href={`/services#${service.slug}`}
            className="group grid grid-cols-1 gap-2 border-t border-border py-6 md:grid-cols-12 md:items-baseline md:gap-6 md:py-7"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() =>
              setActive((cur) => (cur === i ? null : cur))
            }
            onFocus={() => setActive(i)}
            onBlur={() => setActive((cur) => (cur === i ? null : cur))}
          >
            <span className="min-w-0 font-mono text-xs text-muted-foreground md:col-span-1">
              {service.index}
            </span>
            <span className="min-w-0 font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary md:col-span-4 md:text-2xl">
              {service.title}
            </span>
            <span className="min-w-0 text-sm leading-relaxed text-muted-foreground md:col-span-6 md:text-base">
              {service.short}
            </span>
            <span className="hidden min-w-0 justify-end md:col-span-1 md:flex">
              <ArrowRight
                aria-hidden="true"
                className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
              />
            </span>
          </Link>
        ))}
      </div>

      {/* Floating cursor preview (desktop, motion-safe) */}
      {finePointer && !reduced ? (
        <AnimatePresence mode="popLayout">
          {active !== null ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.86, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
              style={{ x, y }}
            >
              <div className="relative -ml-24 -mt-20 h-40 w-60 overflow-hidden border border-primary/50 shadow-pixel-orange">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={SERVICE_IMAGES[SERVICES[active].slug]}
                    initial={{ opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={SERVICE_IMAGES[SERVICES[active].slug]}
                      alt=""
                      fill
                      sizes="240px"
                      className={cn("object-cover")}
                    />
                  </motion.div>
                </AnimatePresence>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 to-transparent px-3 pb-2 pt-6"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {SERVICES[active].index} · {SERVICES[active].title}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </div>
  );
}
