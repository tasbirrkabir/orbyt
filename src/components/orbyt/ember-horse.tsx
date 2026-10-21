"use client";

import { useEffect, useRef } from "react";
import {
  generateHorsePose,
  HORSE_BBOX,
  type FramePrims,
  type Pt,
} from "./horse-frames";

/* ── Orbyt · Ember Horse ───────────────────────────────────
   The working trot, rebuilt in real-time procedural code.
   Features an anatomically proportioned thoroughbred silhouette:
   proud arched crest, pricked ears, sculpted cheek & muzzle,
   athletic withers, saddle dip, rounded croup, lean tucked flank,
   slender cannons, angular hocks, dynamic flowing tail waves,
   wind-blown mane locks, multi-tone incandescent ember lighting,
   trailing stardust sparks, hoof-strike dust, and a ground reflection.
   No video, no stock.
*/

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

const TAU = Math.PI * 2;
const STEPS_PER_SEC = 1.4; // 1.4 full trot cycles (2.8 steps) per sec at standard pace
const GROUND_PER_CYCLE = 22;

function hitStroke(
  s: { x1: number; y1: number; x2: number; y2: number; r1: number; r2: number; d?: number; hot?: boolean },
  x: number,
  y: number
): { hit: boolean; d: number; hot: boolean } {
  const ax = s.x2 - s.x1;
  const ay = s.y2 - s.y1;
  const len2 = ax * ax + ay * ay;
  let t = len2 === 0 ? 0 : ((x - s.x1) * ax + (y - s.y1) * ay) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = s.x1 + t * ax;
  const cy = s.y1 + t * ay;
  const dx = x - cx;
  const dy = y - cy;
  const r = s.r1 + (s.r2 - s.r1) * t;
  const hit = dx * dx + dy * dy < r * r;
  return { hit, d: s.d ?? 1, hot: !!s.hot };
}

function samplePose(
  pose: FramePrims,
  wx: number,
  wy: number
): { d: number; hot: boolean } {
  let best = 0;
  let isHot = false;

  for (let i = 0; i < pose.balls.length; i++) {
    const b = pose.balls[i];
    const dx = wx - b.x;
    const dy = wy - b.y;
    if (dx * dx + dy * dy < b.r * b.r) {
      const d = b.d ?? 1;
      if (d > best) {
        best = d;
        isHot = !!b.hot;
      }
    }
  }

  for (let i = 0; i < pose.strokes.length; i++) {
    const s = pose.strokes[i];
    const res = hitStroke(s, wx, wy);
    if (res.hit && res.d > best) {
      best = res.d;
      isHot = res.hot;
    }
  }

  return { d: best, hot: isHot };
}

export function EmberHorse({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    let unit = 10;
    let cell = 4.2;
    let cx = 0;
    let gy = 0;
    let glowNear: HTMLCanvasElement | null = null;
    let glowHot: HTMLCanvasElement | null = null;
    let glowSize = 0;

    const BW = HORSE_BBOX.maxX - HORSE_BBOX.minX;
    const BH = HORSE_BBOX.maxY - Math.min(0, HORSE_BBOX.minY);

    let stridePhase = 0;
    let pace = 1;
    const targetPace = { current: 1 };
    let last = performance.now();
    let dust: Particle[] = [];
    let embers: Particle[] = [];
    const prevHoofY = [1, 1, 1, 1];

    const createGlow = (innerColor: string, outerColor: string, size: number) => {
      const g = document.createElement("canvas");
      g.width = size;
      g.height = size;
      const gctx = g.getContext("2d");
      if (gctx) {
        const rad = size / 2;
        const grad = gctx.createRadialGradient(rad, rad, 0, rad, rad, rad);
        grad.addColorStop(0, innerColor);
        grad.addColorStop(0.35, outerColor);
        grad.addColorStop(1, "rgba(253,90,1,0)");
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, size, size);
      }
      return g;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      gy = H * 0.84;
      unit = Math.min((W * 0.88) / BW, (gy * 0.94) / BH);
      // High-definition micro-LED matrix density (doubled detail from old 0.6)
      cell = Math.max(3.0, unit * 0.32);
      cx = W / 2 - ((HORSE_BBOX.minX + HORSE_BBOX.maxX) / 2) * unit;

      glowSize = Math.ceil(cell * 2.8);
      glowNear = createGlow("rgba(253,90,1,0.85)", "rgba(253,90,1,0.25)", glowSize);
      glowHot = createGlow("rgba(255,235,190,0.95)", "rgba(253,130,20,0.35)", glowSize);
    };

    const draw = (dt: number) => {
      pace += (targetPace.current - pace) * Math.min(1, dt * 3.5);
      const prevPhase = stridePhase;
      stridePhase += dt * pace * STEPS_PER_SEC;
      if (stridePhase >= 1) stridePhase -= 1;

      ctx.clearRect(0, 0, W, H);
      if (!glowNear || !glowHot) return;

      // Compute exact continuous procedural horse pose
      const pose = generateHorsePose(stridePhase);

      // Hoof-strike dust trigger when hooves touch down
      if (pace > 0.3) {
        for (let i = 0; i < 4; i++) {
          const hoof = pose.hoofs[i];
          if (hoof && prevHoofY[i] > 0.65 && hoof.y <= 0.65) {
            // Hoof impact!
            const count = Math.floor(2 + Math.random() * 3);
            for (let k = 0; k < count; k++) {
              dust.push({
                x: hoof.x + (Math.random() - 0.5) * 1.5,
                y: 0.3 + Math.random() * 0.4,
                vx: -6 - Math.random() * 10 * pace,
                vy: 2.5 + Math.random() * 6.5,
                life: 0,
                max: 0.5 + Math.random() * 0.6,
                size: Math.max(1.4, cell * 0.28),
                color: Math.random() > 0.4 ? "#ffc987" : "#fd5a01",
              });
            }
          }
          if (hoof) prevHoofY[i] = hoof.y;
        }
      }

      // Floating wind ember sparks detached from mane and tail
      if (Math.random() < 0.35 * pace) {
        const isMane = Math.random() > 0.5;
        const spawnX = isMane ? 5 + Math.random() * 6 : -12 - Math.random() * 6;
        const spawnY = isMane ? 20 + Math.random() * 5 : 12 + Math.random() * 6;
        embers.push({
          x: spawnX,
          y: spawnY,
          vx: -7 - Math.random() * 12 * pace,
          vy: (Math.random() - 0.3) * 4,
          life: 0,
          max: 0.8 + Math.random() * 0.9,
          size: Math.max(1.2, cell * 0.22),
          color: Math.random() > 0.3 ? "#ffc987" : "#fd5a01",
        });
      }

      // --- Ground: dotted telemetry track scrolling with stride ---
      const scroll = ((stridePhase * GROUND_PER_CYCLE * unit) % (cell * 2.5));
      ctx.fillStyle = "rgba(253,90,1,0.35)";
      for (let x = -scroll; x < W; x += cell * 2.5) {
        ctx.fillRect(x, gy + cell * 0.5, cell * 0.45, cell * 0.45);
      }
      ctx.fillStyle = "rgba(253,90,1,0.12)";
      for (let x = -scroll * 0.7 - cell; x < W; x += cell * 2.5) {
        ctx.fillRect(x, gy + cell * 1.6, cell * 0.35, cell * 0.35);
      }

      // --- Ground Reflection (Faint inverted mirage under gy) ---
      const reflY = gy + cell * 0.8;
      const reflGrad = ctx.createLinearGradient(0, reflY, 0, Math.min(H, gy + cell * 12));
      reflGrad.addColorStop(0, "rgba(253,90,1,0.09)");
      reflGrad.addColorStop(1, "rgba(253,90,1,0)");
      ctx.fillStyle = reflGrad;
      ctx.fillRect(0, reflY, W, Math.min(H - reflY, cell * 12));

      // --- Particle Physics: Dust & Embers ---
      dust = dust.filter((p) => p.life < p.max);
      for (const p of dust) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 14 * dt; // gravity
        const alpha = Math.sin((p.life / p.max) * Math.PI) * 0.7;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        const sx = cx + p.x * unit;
        const sy = gy - p.y * unit;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      }

      embers = embers.filter((p) => p.life < p.max);
      for (const p of embers) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const alpha = Math.sin((p.life / p.max) * Math.PI) * 0.85;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        const sx = cx + p.x * unit;
        const sy = gy - p.y * unit;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      }

      // --- The Horse: Sampled Micro-LED Matrix ---
      const pad = cell * 1.5;
      const sx0 = cx + pose.bbox.minX * unit - pad;
      const sx1 = cx + pose.bbox.maxX * unit + pad;
      const sy0 = gy - pose.bbox.maxY * unit - pad;
      const sy1 = gy + pad;

      const gx0 = Math.max(0, Math.floor(sx0 / cell));
      const gx1 = Math.min(Math.ceil(W / cell), Math.ceil(sx1 / cell));
      const gy0 = Math.max(0, Math.floor(sy0 / cell));
      const gy1 = Math.min(Math.ceil(H / cell), Math.ceil(sy1 / cell));
      const core = Math.max(1.6, cell * 0.58);

      for (let row = gy0; row < gy1; row++) {
        for (let col = gx0; col < gx1; col++) {
          const sx = (col + 0.5) * cell;
          const sy = (row + 0.5) * cell;
          const hx = (sx - cx) / unit;
          const hy = (gy - sy) / unit;

          const sample = samplePose(pose, hx, hy);
          if (sample.d <= 0.04) continue;

          // Organic LED shimmer + horizon sweep + edge attenuation
          const noise = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
          const flicker = 0.82 + 0.18 * Math.sin((3 + noise * 8) * TAU * 0.35 + noise * TAU);
          const sweep = 0.92 + 0.08 * Math.sin(hx * 0.45 - stridePhase * TAU * 1.2);
          const brightness = sample.d * flicker * sweep;

          // Multi-tone color palette: hot white-amber vs electric orange vs dark far-limb
          const glowCanvas = sample.hot ? glowHot : glowNear;
          const dotColor = sample.hot
            ? (brightness > 0.75 ? "#fff4df" : "#ffc987")
            : (sample.d < 0.9 ? "#b83800" : "#fd5a01");

          // Glow bloom
          ctx.globalAlpha = Math.min(1, brightness * 0.85);
          ctx.drawImage(glowCanvas, sx - glowSize / 2, sy - glowSize / 2);

          // Crisp core LED
          ctx.globalAlpha = Math.min(1, brightness * 1.25);
          ctx.fillStyle = dotColor;
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

    build();

    const onEnter = () => {
      targetPace.current = 1.65; // Accelerate working trot on hover
    };
    const onLeave = () => {
      targetPace.current = 1.0;
    };

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(() => {
      build();
      if (reduced) draw(0.016);
    });
    ro.observe(canvas);

    if (reduced) {
      draw(0.016);
      return () => {
        ro.disconnect();
        canvas.removeEventListener("pointerenter", onEnter);
        canvas.removeEventListener("pointerleave", onLeave);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(loop);
          } else if (!en.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        });
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-full w-full"}
      role="img"
      aria-label="High-resolution procedural ember horse in working trot animation rendered live in code"
    />
  );
}
