"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type EmberFieldProps = {
  /** Particle count. Scales down automatically on small screens. */
  density?: number;
  className?: string;
  /** Global opacity multiplier (0–1). */
  opacity?: number;
};

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  twinkle: number;
};

/**
 * EmberField — canvas particle background: embers rise and drift like
 * sparks off a fire, twinkling between ember-orange and gold. Purely
 * decorative (aria-hidden), pointer-transparent, DPR aware, and parked
 * to a single static frame under prefers-reduced-motion.
 */
export function EmberField({
  density = 46,
  className,
  opacity = 1,
}: EmberFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const spawn = (initial: boolean): Particle => {
      const maxLife = rand(240, 620);
      return {
        x: rand(0, w),
        y: initial ? rand(0, h) : h + rand(4, 40),
        r: rand(0.6, 2.4),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.42, -0.1),
        life: initial ? rand(0, maxLife) : 0,
        maxLife,
        hue: rand(18, 34),
        twinkle: rand(0, Math.PI * 2),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(
        density * (w < 640 ? 0.55 : 1) * (reduced ? 0.5 : 1)
      );
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // life progress 0→1
        const prog = p.life / p.maxLife;
        // fade in fast, fade out slow
        const alpha =
          prog < 0.12 ? prog / 0.12 : prog > 0.7 ? (1 - prog) / 0.3 : 1;
        const tw = 0.65 + 0.35 * Math.sin(p.twinkle + t * 0.0016);
        const a = alpha * tw * 0.85;
        if (a <= 0.01) continue;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 58%, ${a * opacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, ${a * opacity})`;
        ctx.shadowBlur = p.r * 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const step = (t: number) => {
      for (const p of particles) {
        p.x += p.vx + Math.sin(t * 0.0004 + p.twinkle) * 0.08;
        p.y += p.vy;
        p.life += 1;
        if (p.life > p.maxLife || p.y < -12) {
          Object.assign(p, spawn(false));
        }
      }
      drawFrame(t);
      raf = requestAnimationFrame(step);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      // Static frame: embers frozen mid-air.
      drawFrame(0);
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, opacity, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
