"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ParallaxImageProps = {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
  className?: string;
  /** Parallax travel in px. Keep subtle (20–48). */
  travel?: number;
  priority?: boolean;
  /** Cut one corner, matching the pixel-brand clip. */
  clipped?: boolean;
};

/**
 * ParallaxImage — the image moves inside its frame as you scroll (the
 * frame reveals with a clip wipe), and zooms gently on hover. Reduced
 * motion: no parallax, simple fade-in.
 */
export function ParallaxImage({
  src,
  alt,
  label,
  caption,
  className,
  travel = 34,
  priority = false,
  clipped = true,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-travel, travel]);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
      whileInView={reduced ? undefined : { clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "tint-sweep group relative overflow-hidden border border-border bg-card transition-colors duration-300 hover:border-primary/50",
        clipped && "[clip-path:polygon(0_0,calc(100%-26px)_0,100%_26px,100%_100%,0_100%)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-[-14%] h-[128%]"
          style={reduced ? undefined : { y }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        </motion.div>

        {/* Ember gradient wash, lifts on hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-45"
        />

        {label ? (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 md:p-5">
            <div className="min-w-0">
              {label ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {label}
                </p>
              ) : null}
              {caption ? (
                <p className="mt-1 truncate text-sm font-medium text-foreground/90">
                  {caption}
                </p>
              ) : null}
            </div>
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 bg-primary transition-transform duration-300 group-hover:scale-[2.2]"
              style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
            />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Max tilt degrees. */
  max?: number;
};

/**
 * TiltCard — pointer-tracked 3D tilt with a moving glare highlight.
 * Springs back to rest on leave. Disabled under reduced motion.
 */
export function TiltCard({ children, className, max = 7 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative [perspective:900px]", className)}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--rx", `${(py - 0.5) * -2 * max}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
        el.style.setProperty("--glare-x", `${px * 100}%`);
        el.style.setProperty("--glare-y", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      }}
    >
      <div
        className="relative h-full w-full transition-transform duration-300 ease-out"
        style={
          {
            transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            transformStyle: "preserve-3d",
          } as CSSProperties
        }
      >
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(360px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(253,90,1,0.14), transparent 60%)",
          }}
        />
      </div>
    </motion.div>
  );
}
