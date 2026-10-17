"use client";

import { useEffect, useRef } from "react";

/* ── Orbyt · Ember Horse ───────────────────────────────────
   The gallop, rebuilt in code. A procedural horse — body capsule,
   four legs driven by two-bone IK over elliptical foot paths,
   bobbing torso, waving tail — sampled every frame into a grid
   of glowing ember dots. Muybridge in LED. No video, no stock. */

type Vec = { x: number; y: number };
type Seg = { a: Vec; b: Vec; r: number };
type Ball = { c: Vec; r: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number };

type Leg = {
  anchor: Vec;
  rest: number;
  phase: number;
  lift: number;
  upper: number;
  lower: number;
  wU: number;
  wL: number;
};

/* Horse units: origin on the ground under body center, x+ forward, y+ up. */
const BODY_A: Vec = { x: -11.5, y: 13.5 };
const BODY_B: Vec = { x: 8, y: 12.5 };
const BODY_R = 4.2;
const CENTER: Vec = { x: 0, y: 13 };

const LEGS: Leg[] = [
  { anchor: { x: -10.2, y: 12.8 }, rest: -3.0, phase: 0.16, lift: 6.0, upper: 7.6, lower: 7.2, wU: 1.7, wL: 1.2 },
  { anchor: { x: -8.6, y: 12.4 }, rest: -3.6, phase: 0.02, lift: 6.0, upper: 7.6, lower: 7.2, wU: 1.8, wL: 1.3 },
  { anchor: { x: 5.8, y: 11.8 }, rest: 2.8, phase: 0.52, lift: 7.0, upper: 7.4, lower: 7.0, wU: 1.6, wL: 1.15 },
  { anchor: { x: 7.2, y: 12.1 }, rest: 2.4, phase: 0.68, lift: 7.0, upper: 7.4, lower: 7.0, wU: 1.7, wL: 1.25 },
];

const STRIDE = 8.5;
const CYCLES_PER_SEC = 1.15;
const TAU = Math.PI * 2;

function distToSeg2(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const ex = px - cx;
  const ey = py - cy;
  return ex * ex + ey * ey;
}

/** Two-bone IK: joint position + clamped foot. bend −1 folds the joint backward. */
function solveLeg(a: Vec, foot: Vec, l1: number, l2: number) {
  let dx = foot.x - a.x;
  let dy = foot.y - a.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.02;
  const minD = Math.abs(l1 - l2) + 0.02;
  if (d > maxD) {
    const s = maxD / d;
    dx *= s;
    dy *= s;
    d = maxD;
  } else if (d < minD) {
    const s = minD / d;
    dx *= s;
    dy *= s;
    d = minD;
  }
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const a1 = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const base = Math.atan2(dy, dx);
  const ang = base - a1; // fold backward, like a real knee/hock
  return {
    knee: { x: a.x + Math.cos(ang) * l1, y: a.y + Math.sin(ang) * l1 },
    foot: { x: a.x + dx, y: a.y + dy },
  };
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
    let unit = 12;
    let cx = 0;
    let gy = 0;
    let cell = 7;
    let glow: HTMLCanvasElement | null = null;
    let glowSize = 0;

    let theta = 0.18;
    let pace = 1;
    const targetPace = { current: 1 };
    let last = performance.now();
    const prevSwing = [0, 0, 0, 0];
    let dust: Particle[] = [];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.52;
      gy = H * 0.88;
      unit = Math.min(W / 62, (gy * 0.98) / 26.5);
      cell = Math.max(6, Math.round(Math.min(W, H) / 58));

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

    /** One frame of the horse in horse-units → list of balls + segments. */
    const rig = () => {
      const bob = 0.9 * Math.sin(TAU * theta + 0.6);
      const pitch = 0.055 * Math.sin(TAU * theta + 1.4);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const att = (p: Vec): Vec => ({
        x: CENTER.x + (p.x - CENTER.x) * cosP - (p.y - CENTER.y) * sinP,
        y: CENTER.y + (p.x - CENTER.x) * sinP + (p.y - CENTER.y) * cosP + bob,
      });

      const bodyA = att(BODY_A);
      const bodyB = att(BODY_B);
      const balls: Ball[] = [
        { c: att({ x: 7.5, y: 12.4 }), r: 4.0 },
        { c: att({ x: -9.5, y: 14.0 }), r: 4.4 },
        { c: att({ x: 19.2, y: 21.6 }), r: 2.1 },
        { c: att({ x: 19.9, y: 24.0 }), r: 1.0 },
      ];
      const segs: Seg[] = [
        { a: bodyA, b: bodyB, r: BODY_R },
        { a: att({ x: 8, y: 14.5 }), b: att({ x: 17.5, y: 20.8 }), r: 2.7 },
        { a: att({ x: 18.6, y: 20.9 }), b: att({ x: 24.0, y: 20.1 }), r: 1.6 },
      ];

      /* Tail: three waving segments off the haunch */
      let tip = att({ x: -13, y: 14.6 });
      let dir = 3.55; // radians — back and sweeping down
      for (let i = 0; i < 3; i++) {
        dir += Math.sin(TAU * theta * 1.6 - i * 0.9) * 0.14 - 0.1;
        const next = {
          x: tip.x + Math.cos(dir) * 5.0,
          y: tip.y + Math.sin(dir) * 5.0,
        };
        segs.push({ a: tip, b: next, r: 1.8 - i * 0.22 });
        tip = next;
      }

      /* Legs: elliptical foot paths + IK */
      const legs = LEGS.map((leg, i) => {
        const phi = TAU * (theta + leg.phase);
        const a = att(leg.anchor);
        const foot = {
          x: a.x + leg.rest + STRIDE * Math.cos(phi),
          y: leg.lift * Math.max(0, Math.sin(phi)),
        };
        const solved = solveLeg(a, foot, leg.upper, leg.lower);
        /* hoof-strike dust when the foot lands */
        const swing = Math.sin(phi) > 0 ? 1 : 0;
        if (prevSwing[i] === 1 && swing === 0 && pace > 0.4) {
          for (let k = 0; k < 2; k++) {
            dust.push({
              x: solved.foot.x + (Math.random() - 0.5) * 2,
              y: solved.foot.y + Math.random(),
              vx: -6 - Math.random() * 8,
              vy: 4 + Math.random() * 9,
              life: 0,
              max: 0.7 + Math.random() * 0.7,
            });
          }
        }
        prevSwing[i] = swing;
        return { leg, a, solved };
      });

      return { balls, segs, legs };
    };

    const inside = (
      px: number,
      py: number,
      balls: Ball[],
      segs: Seg[],
      legs: ReturnType<typeof rig>["legs"]
    ) => {
      for (const b of balls) {
        const dx = px - b.c.x;
        const dy = py - b.c.y;
        if (dx * dx + dy * dy < b.r * b.r) return true;
      }
      for (const s of segs) {
        if (distToSeg2(px, py, s.a.x, s.a.y, s.b.x, s.b.y) < s.r * s.r) return true;
      }
      for (const l of legs) {
        if (
          distToSeg2(px, py, l.a.x, l.a.y, l.solved.knee.x, l.solved.knee.y) <
          l.leg.wU * l.leg.wU
        )
          return true;
        if (
          distToSeg2(
            px,
            py,
            l.solved.knee.x,
            l.solved.knee.y,
            l.solved.foot.x,
            l.solved.foot.y
          ) < l.leg.wL * l.leg.wL
        )
          return true;
        const hx = px - l.solved.foot.x;
        const hy = py - l.solved.foot.y;
        if (hx * hx + hy * hy < 3.2) return true;
      }
      return false;
    };

    const emberFill = (a: number) =>
      `rgba(255,${Math.round(120 + 80 * a)},${Math.round(30 + 50 * a)},${a})`;

    const draw = (dt: number) => {
      pace += (targetPace.current - pace) * Math.min(1, dt * 3);
      theta += dt * pace * CYCLES_PER_SEC;
      if (theta > 1) theta -= 1;

      ctx.clearRect(0, 0, W, H);
      if (!glow) return;

      const { balls, segs, legs } = rig();

      /* Ground: scrolling dotted track, speed matched to the stride */
      const scroll = (theta * 2 * STRIDE * unit) % (cell * 2.4);
      ctx.fillStyle = "rgba(253,90,1,0.4)";
      for (let x = -scroll; x < W; x += cell * 2.4) {
        ctx.fillRect(x, gy + cell * 0.4, cell * 0.5, cell * 0.5);
      }
      ctx.fillStyle = "rgba(253,90,1,0.16)";
      for (let x = -scroll * 0.72 - cell; x < W; x += cell * 2.4) {
        ctx.fillRect(x, gy + cell * 1.5, cell * 0.4, cell * 0.4);
      }

      /* Dust kicked at hoof-strike */
      dust = dust.filter((p) => p.life < p.max);
      for (const p of dust) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 14 * dt;
        const a = Math.sin((p.life / p.max) * Math.PI) * 0.5;
        ctx.fillStyle = emberFill(a);
        const sx = cx + p.x * unit;
        const sy = gy - p.y * unit;
        ctx.fillRect(sx, sy, 2, 2);
      }

      /* The horse, sampled to LED dots */
      const minX = cx + (-29 * unit);
      const maxX = cx + (27 * unit);
      const maxY = gy;
      const minY = gy - 26.5 * unit;
      const gx0 = Math.max(0, Math.floor(minX / cell));
      const gx1 = Math.min(W, Math.ceil(maxX / cell));
      const gy0 = Math.max(0, Math.floor(minY / cell));
      const gy1 = Math.min(H, Math.ceil(maxY / cell));

      for (let gyx = gy0; gyx < gy1; gyx++) {
        for (let gxx = gx0; gxx < gx1; gxx++) {
          const sx = (gxx + 0.5) * cell;
          const sy = (gyx + 0.5) * cell;
          const hx = (sx - cx) / unit;
          const hy = (gy - sy) / unit;
          if (!inside(hx, hy, balls, segs, legs)) continue;

          /* scanline sweep + edge-of-field falloff */
          const sweep = 0.9 + 0.1 * Math.sin(hx * 0.7 - theta * TAU * 2);
          const edge =
            0.55 +
            0.45 * Math.max(0, Math.min(1, 1 - Math.abs(hx) / 34));
          const b = sweep * edge;

          ctx.globalAlpha = Math.min(1, b);
          ctx.drawImage(glow, sx - glowSize / 2, sy - glowSize / 2);
          ctx.globalAlpha = Math.min(1, b * 1.4);
          ctx.fillStyle = b > 0.85 ? "#ffc987" : "#fd5a01";
          const core = Math.max(1.6, cell * 0.52);
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
      theta = 0.3;
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

    const onEnter = () => (targetPace.current = 2.3);
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
