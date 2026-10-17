"use client";

import { useEffect, useRef } from "react";
import {
  HORSE_FRAMES,
  HORSE_HOOFS,
  HORSE_BBOX,
  type Stroke,
  type Ball,
} from "./horse-frames";

/* ── Orbyt · Ember Horse ───────────────────────────────────
   The gallop, rebuilt in code. Eight hand-posed keyframes
   (see horse-frames.ts — after Muybridge, no IK) sampled
   every frame into a grid of glowing ember dots, with brief
   crossfades between poses, per-dot flicker, hoof-strike
   dust and a ground track that scrolls with the stride.
   Muybridge in LED. No video, no stock. */

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const FRAMES = HORSE_FRAMES.length;
/** keyframe steps per second at pace 1 — a full stride ≈ 0.76s */
const STEPS_PER_SEC = 10.5;
/** ground units the world travels per stride */
const GROUND_PER_CYCLE = 26;
const TAU = Math.PI * 2;

function hitStroke(s: Stroke, x: number, y: number): boolean {
  const ax = s.x2 - s.x1;
  const ay = s.y2 - s.y1;
  const len2 = ax * ax + ay * ay;
  let t = len2 === 0 ? 0 : ((x - s.x1) * ax + (y - s.y1) * ay) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = x - (s.x1 + t * ax);
  const dy = y - (s.y1 + t * ay);
  return dx * dx + dy * dy < s.r * s.r;
}

function hitBall(b: Ball, x: number, y: number): boolean {
  const dx = x - b.x;
  const dy = y - b.y;
  return dx * dx + dy * dy < b.r * b.r;
}

/** Brightness weight of the silhouette at a point (far legs are dimmer). */
function sampleFrame(fr: (typeof HORSE_FRAMES)[number], x: number, y: number): number {
  let best = 0;
  for (const b of fr.balls) {
    if (hitBall(b, x, y)) {
      const d = b.d ?? 1;
      if (d > best) best = d;
    }
  }
  if (best < 1) {
    for (const s of fr.strokes) {
      if (hitStroke(s, x, y)) {
        const d = s.d ?? 1;
        if (d > best) best = d;
      }
    }
  }
  return best;
}

export function EmberHorse({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    let unit = 10;
    let cell = 8;
    let cx = 0;
    let gy = 0;
    let glow: HTMLCanvasElement | null = null;
    let glowSize = 0;

    const BW = HORSE_BBOX.maxX - HORSE_BBOX.minX;
    const BH = HORSE_BBOX.maxY - Math.min(0, HORSE_BBOX.minY);

    let cycle = 0;
    let pace = 1;
    const targetPace = { current: 1 };
    let last = performance.now();
    let dust: Particle[] = [];
    const prevHoofY = [9, 9, 9, 9];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gy = H * 0.87;
      unit = Math.min((W * 0.92) / BW, (gy * 0.96) / BH);
      /* finer grid than the body needs so head/ears/legs keep their
         detail when the silhouette is sampled to ember dots */
      cell = unit * 0.6;
      cx = W / 2 - ((HORSE_BBOX.minX + HORSE_BBOX.maxX) / 2) * unit;

      glowSize = Math.ceil(cell * 3);
      const g = document.createElement("canvas");
      g.width = glowSize;
      g.height = glowSize;
      const gctx = g.getContext("2d");
      if (gctx) {
        const grad = gctx.createRadialGradient(
          glowSize / 2,
          glowSize / 2,
          0,
          glowSize / 2,
          glowSize / 2,
          glowSize / 2
        );
        grad.addColorStop(0, "rgba(255,178,92,0.9)");
        grad.addColorStop(0.35, "rgba(253,90,1,0.45)");
        grad.addColorStop(1, "rgba(253,90,1,0)");
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, glowSize, glowSize);
      }
      glow = g;
    };

    const draw = (dt: number) => {
      pace += (targetPace.current - pace) * Math.min(1, dt * 3);
      const prevCycle = cycle;
      cycle += dt * pace * STEPS_PER_SEC;
      if (cycle >= FRAMES) cycle -= FRAMES;

      ctx.clearRect(0, 0, W, H);
      if (!glow) return;

      const f = Math.floor(cycle) % FRAMES;
      const t = cycle - Math.floor(cycle);
      /* brief crossfade into the next pose at the end of each step */
      const bw = t < 0.7 ? 0 : (t - 0.7) / 0.3;
      const w = bw * bw * (3 - 2 * bw);
      const frA = HORSE_FRAMES[f];
      const frB = HORSE_FRAMES[(f + 1) % FRAMES];

      /* hoof-strike dust on frame boundaries */
      if (Math.floor(cycle) !== Math.floor(prevCycle) && pace > 0.35) {
        const hoofs = HORSE_HOOFS[(f + 1) % FRAMES];
        for (let i = 0; i < 4; i++) {
          if (prevHoofY[i] > 0.9 && hoofs[i].y <= 0.9) {
            for (let k = 0; k < 2; k++) {
              dust.push({
                x: hoofs[i].x + (Math.random() - 0.5) * 2,
                y: 0.4 + Math.random(),
                vx: -5 - Math.random() * 9,
                vy: 3 + Math.random() * 8,
                life: 0,
                max: 0.6 + Math.random() * 0.7,
              });
            }
          }
          prevHoofY[i] = hoofs[i].y;
        }
      }

      /* Ground: dotted track scrolling with the stride */
      const scroll = ((cycle / FRAMES) * GROUND_PER_CYCLE * unit) % (cell * 2.4);
      ctx.fillStyle = "rgba(253,90,1,0.4)";
      for (let x = -scroll; x < W; x += cell * 2.4) {
        ctx.fillRect(x, gy + cell * 0.45, cell * 0.5, cell * 0.5);
      }
      ctx.fillStyle = "rgba(253,90,1,0.15)";
      for (let x = -scroll * 0.7 - cell; x < W; x += cell * 2.4) {
        ctx.fillRect(x, gy + cell * 1.6, cell * 0.4, cell * 0.4);
      }

      /* Dust kicked at hoof-strike */
      dust = dust.filter((p) => p.life < p.max);
      for (const p of dust) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 13 * dt;
        const a = Math.sin((p.life / p.max) * Math.PI) * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fd5a01";
        const sx = cx + p.x * unit;
        const sy = gy - p.y * unit;
        ctx.fillRect(sx, sy, Math.max(1.5, cell * 0.22), Math.max(1.5, cell * 0.22));
      }

      /* The horse, sampled to LED dots */
      const pad = cell;
      const sx0 = cx + HORSE_BBOX.minX * unit - pad;
      const sx1 = cx + HORSE_BBOX.maxX * unit + pad;
      const sy0 = gy - HORSE_BBOX.maxY * unit - pad;
      const sy1 = gy + pad;
      const gx0 = Math.max(0, Math.floor(sx0 / cell));
      const gx1 = Math.min(W, Math.ceil(sx1 / cell));
      const gy0 = Math.max(0, Math.floor(sy0 / cell));
      const gy1 = Math.min(H, Math.ceil(sy1 / cell));
      const core = Math.max(1.5, cell * 0.5);

      for (let row = gy0; row < gy1; row++) {
        for (let col = gx0; col < gx1; col++) {
          const sx = (col + 0.5) * cell;
          const sy = (row + 0.5) * cell;
          const hx = (sx - cx) / unit;
          const hy = (gy - sy) / unit;

          const aA = sampleFrame(frA, hx, hy);
          let a = aA;
          if (w > 0) {
            const aB = sampleFrame(frB, hx, hy);
            a = aA * (1 - w) + aB * w;
          }
          if (a <= 0.04) continue;

          /* per-dot flicker + sweep + edge-of-field falloff */
          const h = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
          const flicker = 0.78 + 0.22 * Math.sin((3 + h * 9) * TAU * 0.35 + h * TAU);
          const sweep = 0.9 + 0.1 * Math.sin(hx * 0.55 - cycle * 1.4);
          const edge =
            0.6 + 0.4 * Math.max(0, Math.min(1, 1 - Math.abs(hx) / (BW / 2 + 4)));
          const b = a * flicker * sweep * edge;

          ctx.globalAlpha = Math.min(1, b);
          ctx.drawImage(glow, sx - glowSize / 2, sy - glowSize / 2);
          ctx.globalAlpha = Math.min(1, b * 1.45);
          ctx.fillStyle = b > 0.82 ? "#ffc987" : "#fd5a01";
          ctx.fillRect(sx - core / 2, sy - core / 2, core, core);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    build();
    const ro = new ResizeObserver(() => {
      build();
      if (reduced) draw(0.016);
    });
    ro.observe(canvas);

    if (reduced) {
      cycle = 0;
      draw(0.016);
      return () => {
        stop();
        ro.disconnect();
      };
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onEnter = () => (targetPace.current = 2.2);
    const onLeave = () => (targetPace.current = 1);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  );
}
