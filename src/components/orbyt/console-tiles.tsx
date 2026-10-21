"use client";

import { useEffect, useRef, useState } from "react";

/* ── Orbyt · Console instruments ───────────────────────────
   The gallery without photographs: five live instruments,
   each drawn by code on the visitor's machine.
   Elevated with rich physical dynamics, 3D perspective,
   clean typographic dot matrices, gravitational physics,
   and incandescent multi-spectral ember rendering.
*/

type InstrumentState = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  t: number;
  dt: number;
  hover: boolean;
  pointer: { x: number; y: number } | null;
};

type Instrument = {
  build?: (W: number, H: number) => void;
  step: (s: InstrumentState) => void;
};

type Factory = () => Instrument;

const TAU = Math.PI * 2;

function useInstrument(factory: Factory) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inst = factory();

    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    let t = 0;
    let last = performance.now();
    let hover = false;
    let pointer: { x: number; y: number } | null = null;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      inst.build?.(W, H);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      try {
        inst.step({ ctx, W, H, t, dt, hover, pointer });
      } catch (err) {
        console.error("[instrument] step failed", err);
        stop();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const still = () => {
      t = 1.3;
      inst.step({ ctx, W, H, t, dt: 0.016, hover: false, pointer: null });
    };

    build();
    const ro = new ResizeObserver(() => {
      build();
      if (reduced) still();
    });
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onEnter = () => (hover = true);
    const onLeave = () => {
      hover = false;
      pointer = null;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);

    if (reduced) {
      still();
      return () => {
        ro.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerenter", onEnter);
        canvas.removeEventListener("pointerleave", onLeave);
      };
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [factory]);

  return ref;
}

/* 01 — THE ORBIT: The 5 Agency Disciplines in One Connected System Loop */
const orbitInstrument: Factory = () => {
  const DISCIPLINES = [
    { label: "WEB", sub: "Conversion UI" },
    { label: "ADS", sub: "Acquisition" },
    { label: "DATA", sub: "Attribution" },
    { label: "AI", sub: "Automations" },
    { label: "OPS", sub: "Operations" },
  ];

  return {
    step: ({ ctx, W, H, t, hover, pointer }) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H * 0.52;
      const speed = hover ? 1.5 : 1.0;
      const R = Math.min(W * 0.36, H * 0.38);

      // Interactive subtle 3D tilt tracking
      let tiltX = 0;
      let tiltY = 0;
      if (pointer) {
        tiltX = ((pointer.x - cx) / W) * 8;
        tiltY = ((pointer.y - cy) / H) * 6;
      }

      // Draw outer dashed system bus ring
      const ringDots = 64;
      for (let i = 0; i < ringDots; i++) {
        const a = (i / ringDots) * TAU;
        const px = cx + tiltX + Math.cos(a) * R;
        const py = cy + tiltY + Math.sin(a) * (R * 0.88);
        const dash = 0.5 + 0.5 * Math.sin(a * 5 - t * 1.5 * speed);
        ctx.globalAlpha = 0.15 + 0.25 * dash;
        ctx.fillStyle = "#fd5a01";
        ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);
      }

      // Draw inner circuit ring
      const innerR = R * 0.62;
      ctx.strokeStyle = "rgba(253,90,1,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx + tiltX, cy + tiltY, innerR, innerR * 0.88, 0, 0, TAU);
      ctx.stroke();

      // Flowing data pulses between discipline nodes
      const pulseCount = 4;
      for (let p = 0; p < pulseCount; p++) {
        const pulseAngle = (t * 0.45 * speed + (p / pulseCount) * TAU) % TAU;
        
        // Comet tail for pulse
        for (let k = 6; k >= 1; k--) {
          const lagA = pulseAngle - k * 0.05;
          const tx = cx + tiltX + Math.cos(lagA) * R;
          const ty = cy + tiltY + Math.sin(lagA) * (R * 0.88);
          ctx.globalAlpha = 0.4 * (1 - k / 7);
          ctx.fillStyle = "#fd5a01";
          ctx.fillRect(tx - 1.5, ty - 1.5, 3, 3);
        }

        const hx = cx + tiltX + Math.cos(pulseAngle) * R;
        const hy = cy + tiltY + Math.sin(pulseAngle) * (R * 0.88);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff0db";
        ctx.fillRect(hx - 2.5, hy - 2.5, 5, 5);
      }

      // The 5 Agency Discipline Nodes placed around the ring
      DISCIPLINES.forEach((disc, i) => {
        const angle = (i / 5) * TAU - Math.PI / 2;
        const nx = cx + tiltX + Math.cos(angle) * R;
        const ny = cy + tiltY + Math.sin(angle) * (R * 0.88);

        // Radial connector spoke to core
        ctx.strokeStyle = "rgba(253,90,1,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + tiltX, cy + tiltY);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Node Card Box
        const cardW = 60;
        const cardH = 22;
        ctx.fillStyle = "#161311";
        ctx.strokeStyle = "#2c2622";
        ctx.lineWidth = 1;
        ctx.fillRect(nx - cardW / 2, ny - cardH / 2, cardW, cardH);
        ctx.strokeRect(nx - cardW / 2, ny - cardH / 2, cardW, cardH);

        // Active indicator dot
        ctx.fillStyle = "#fd5a01";
        ctx.fillRect(nx - cardW / 2 + 5, ny - 2.5, 5, 5);

        // Node label
        ctx.fillStyle = "#e8e3de";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(disc.label, nx - cardW / 2 + 15, ny);
      });

      // Center Core: ORBYT SYSTEM ENGINE
      const corePulse = 1.0 + 0.05 * Math.sin(t * 2.5);
      const coreR = innerR * 0.5 * corePulse;
      const glow = ctx.createRadialGradient(cx + tiltX, cy + tiltY, 0, cx + tiltX, cy + tiltY, coreR * 1.5);
      glow.addColorStop(0, "rgba(253,90,1,0.22)");
      glow.addColorStop(1, "rgba(253,90,1,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx + tiltX - coreR * 1.5, cy + tiltY - coreR * 1.5, coreR * 3, coreR * 3);

      // Core center badge
      ctx.fillStyle = "#12100f";
      ctx.strokeStyle = "#fd5a01";
      ctx.lineWidth = 1.5;
      const bW = 86;
      const bH = 34;
      ctx.fillRect(cx + tiltX - bW / 2, cy + tiltY - bH / 2, bW, bH);
      ctx.strokeRect(cx + tiltX - bW / 2, cy + tiltY - bH / 2, bW, bH);

      ctx.fillStyle = "#fd5a01";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ORBYT CORE", cx + tiltX, cy + tiltY - 5);

      ctx.fillStyle = "#4ade80";
      ctx.font = "8px monospace";
      ctx.fillText("100% CONNECTED", cx + tiltX, cy + tiltY + 7);

      ctx.globalAlpha = 1;
    },
  };
};

/* 02 — THE CARRIER: Telemetry data drops with particle splash & speed dynamics */
const carrierInstrument: Factory = () => {
  type Drop = { x: number; y: number; sp: number; length: number; a: number; hex: string };
  type Splash = { x: number; y: number; vx: number; vy: number; life: number; max: number };

  let drops: Drop[] = [];
  let splashes: Splash[] = [];

  const HEX_CHARS = ["DEPLOY", "CAPI", "LEAD", "SYNC", "CRO", "v2.4", "API", "OK"];

  return {
    build: (W) => {
      drops = [];
      splashes = [];
      const colWidth = Math.max(14, W / 24);
      for (let x = colWidth / 2; x < W; x += colWidth) {
        drops.push({
          x,
          y: Math.random() * 300,
          sp: 28 + Math.random() * 65,
          length: Math.floor(5 + Math.random() * 5),
          a: 0.4 + Math.random() * 0.5,
          hex: HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
        });
      }
    },
    step: ({ ctx, W, H, t, dt, hover }) => {
      ctx.clearRect(0, 0, W, H);
      const speedMult = hover ? 1.85 : 1.0;
      const gap = 8;

      // Update and draw splashes
      splashes = splashes.filter((s) => s.life < s.max);
      for (const s of splashes) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 22 * dt; // gravity
        const alpha = (1 - s.life / s.max) * 0.65;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = "#ffc987";
        ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
      }

      for (const d of drops) {
        d.y += d.sp * speedMult * dt;

        // When drop strikes floor, trigger splash
        if (d.y > H - 8) {
          d.y = -Math.random() * H * 0.35;
          d.sp = 28 + Math.random() * 65;
          d.a = 0.4 + Math.random() * 0.5;
          d.hex = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];

          for (let k = 0; k < 2; k++) {
            splashes.push({
              x: d.x,
              y: H - 8,
              vx: (Math.random() - 0.5) * 14,
              vy: -8 - Math.random() * 12,
              life: 0,
              max: 0.35 + Math.random() * 0.25,
            });
          }
        }

        // Draw falling packet trail
        for (let k = 0; k < d.length; k++) {
          const py = d.y - k * gap;
          if (py < -6 || py > H + 4) continue;

          const isHead = k === 0;
          const alpha = (isHead ? 1.0 : 0.65 * (1 - k / d.length)) * d.a;
          ctx.globalAlpha = Math.min(1, alpha);

          if (isHead) {
            // Bright leading spark + digital telemetry token
            ctx.fillStyle = Math.sin(t * 4 + d.x) > 0.3 ? "#fff0db" : "#ffc987";
            ctx.fillRect(d.x - 2, py - 2, 4, 4);
            if (d.x % 32 < 16) {
              ctx.font = "8px monospace";
              ctx.fillStyle = "#fd5a01";
              ctx.textAlign = "left";
              ctx.fillText(d.hex, d.x + 6, py + 3);
            }
          } else {
            // Body trail
            ctx.fillStyle = "#fd5a01";
            const sz = Math.max(1.5, 2.8 * (1 - k / (d.length + 2)));
            ctx.fillRect(d.x - sz / 2, py - sz / 2, sz, sz);
          }
        }
      }
      ctx.globalAlpha = 1;
    },
  };
};

/* 03 — THE PULL: Interactive harmonic lattice with magnetic cursor vortex */
const magnetInstrument: Factory = () => {
  type Node = { hx: number; hy: number; x: number; y: number; vx: number; vy: number };
  let dots: Node[] = [];

  return {
    build: (W, H) => {
      dots = [];
      const step = Math.max(14, Math.min(W, H) / 13);
      for (let y = step * 0.9; y < H; y += step) {
        for (let x = step * 0.7; x < W; x += step) {
          dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
        }
      }
    },
    step: ({ ctx, W, H, t, dt, pointer }) => {
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.65;
      const sigma2 = 2 * R * R * 0.28;

      for (const d of dots) {
        // Organic idle harmonic wave
        const waveX = Math.sin(t * 1.4 + (d.hx + d.hy) * 0.025) * 1.8;
        const waveY = Math.cos(t * 1.2 + (d.hx - d.hy) * 0.025) * 1.8;
        let tx = d.hx + waveX;
        let ty = d.hy + waveY;
        let pull = 0;

        if (pointer) {
          const dx = pointer.x - d.hx;
          const dy = pointer.y - d.hy;
          const dist = Math.hypot(dx, dy);
          pull = Math.exp(-(dist * dist) / sigma2);
          if (pull > 0.02 && dist > 0.001) {
            const force = Math.min(dist * 0.65, R * 0.48) * pull;
            tx += (dx / dist) * force;
            ty += (dy / dist) * force;
          }
        }

        // Spring smoothing
        const k = Math.min(1, dt * 9);
        d.x += (tx - d.x) * k;
        d.y += (ty - d.y) * k;

        // Render point
        ctx.globalAlpha = Math.min(0.98, 0.28 + 0.7 * pull);
        const sz = 1.8 + 2.8 * pull;

        if (pull > 0.5) {
          ctx.fillStyle = "#fff0db"; // incandescent white-hot near cursor
        } else if (pull > 0.2) {
          ctx.fillStyle = "#ffc987";
        } else {
          ctx.fillStyle = "#fd5a01";
        }

        ctx.fillRect(d.x - sz / 2, d.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    },
  };
};

/* 04 — THE NAME: Precision hand-crafted 5x7 bitmap font LED matrix */
const WORDS = ["ORBYT", "BUILD", "SCALE", "GROW"] as const;

// Precision 5x7 bitmap definitions (1 = active pixel, 0 = inactive)
const FONT_5X7: Record<string, number[]> = {
  O: [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0,
  ],
  R: [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
    1, 0, 1, 0, 0,
    1, 0, 0, 1, 0,
    1, 0, 0, 0, 1,
  ],
  B: [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
  ],
  Y: [
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 0, 1, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
  ],
  T: [
    1, 1, 1, 1, 1,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
  ],
  U: [
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0,
  ],
  I: [
    1, 1, 1, 1, 1,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    1, 1, 1, 1, 1,
  ],
  L: [
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
  ],
  D: [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
  ],
  S: [
    0, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    0, 1, 1, 1, 0,
    0, 0, 0, 0, 1,
    0, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
  ],
  C: [
    0, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    0, 1, 1, 1, 1,
  ],
  A: [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
  ],
  G: [
    0, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0,
  ],
  W: [
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 1, 0, 1,
    1, 0, 1, 0, 1,
    1, 1, 0, 1, 1,
    1, 0, 0, 0, 1,
  ],
  H: [
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
  ],
  P: [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
  ],
  M: [
    1, 0, 0, 0, 1,
    1, 1, 0, 1, 1,
    1, 0, 1, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
  ],
  V: [
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 0, 1, 0,
    0, 1, 0, 1, 0,
    0, 0, 1, 0, 0,
  ],
  E: [
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
  ],
};

const glyphInstrument: Factory = () => {
  let cell = 6;
  let cols = 35;
  let rows = 11;
  let ox = 0;
  let oy = 0;

  // Build binary word grids
  const wordGrids: Uint8Array[] = WORDS.map((word) => {
    // 5 letters * 5 + 4 spacing = 29 cols wide
    const grid = new Uint8Array(35 * 11);
    const wordWidth = word.length * 5 + (word.length - 1) * 1;
    const startCol = Math.floor((35 - wordWidth) / 2);
    const startRow = 2; // centered vertically in 11 rows

    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      const char = word[charIdx];
      const font = FONT_5X7[char];
      if (!font) continue;
      const charLeft = startCol + charIdx * 6;

      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (font[r * 5 + c] === 1) {
            const gx = charLeft + c;
            const gy = startRow + r;
            if (gx >= 0 && gx < 35 && gy >= 0 && gy < 11) {
              grid[gy * 35 + gx] = 1;
            }
          }
        }
      }
    }
    return grid;
  });

  return {
    build: (W, H) => {
      // Calculate responsive cell size
      cell = Math.max(4.5, Math.min(8.5, W / 38));
      cols = Math.floor(W / cell);
      rows = Math.floor(H / cell);
      ox = Math.floor((W - 35 * cell) / 2);
      oy = Math.floor((H - 11 * cell) / 2);
    },
    step: ({ ctx, W, H, t }) => {
      ctx.clearRect(0, 0, W, H);
      const dur = 2.8;
      const idx = Math.floor(t / dur) % WORDS.length;
      const ph = (t % dur) / dur;

      // Cascading wave transition
      const transStart = 0.82;
      const transProgress = ph < transStart ? 0 : (ph - transStart) / (1 - transStart);

      const gridA = wordGrids[idx];
      const gridB = wordGrids[(idx + 1) % WORDS.length];
      const dotSz = Math.max(1.8, cell * 0.62);

      for (let r = 0; r < 11; r++) {
        for (let c = 0; c < 35; c++) {
          const px = ox + c * cell + cell / 2;
          const py = oy + r * cell + cell / 2;
          if (px < 0 || px > W || py < 0 || py > H) continue;

          const valA = gridA[r * 35 + c] ?? 0;
          const valB = gridB[r * 35 + c] ?? 0;

          // Horizontal cascade wipe
          const colThreshold = c / 35;
          const activeVal = transProgress > colThreshold ? valB : valA;

          if (activeVal === 1) {
            const noise = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
            const flicker = 0.8 + 0.2 * Math.sin(t * (3 + noise * 6) + noise * TAU);

            // Glow bloom
            ctx.globalAlpha = 0.45 * flicker;
            ctx.fillStyle = "#fd5a01";
            ctx.fillRect(px - dotSz * 0.9, py - dotSz * 0.9, dotSz * 1.8, dotSz * 1.8);

            // Core LED dot
            ctx.globalAlpha = Math.min(1, flicker * 1.2);
            ctx.fillStyle = flicker > 0.88 ? "#fff0db" : "#fd5a01";
            ctx.fillRect(px - dotSz / 2, py - dotSz / 2, dotSz, dotSz);
          } else {
            // Faint inactive hardware matrix grid dot
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = "#fd5a01";
            ctx.fillRect(px - 1, py - 1, 2, 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    },
  };
};

function InstrumentCanvas({
  factory,
  label,
}: {
  factory: Factory;
  label: string;
}) {
  const ref = useInstrument(factory);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className="absolute inset-0 h-full w-full"
    />
  );
}

/* 05 — THE CLOCK: Dhaka time, day progress, always on */
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  weekday: "short",
  day: "2-digit",
  month: "short",
});

export function ConsoleClock() {
  const [now, setNow] = useState<{ time: string; date: string; pct: number } | null>(
    null
  );

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const time = timeFmt.format(d);
      const [hh, mm, ss] = time.split(":").map(Number);
      const pct = Math.round((((hh * 60 + mm) * 60 + ss) / 86400) * 100);
      setNow({ time, date: dateFmt.format(d).toUpperCase(), pct });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col px-6 py-5 sm:px-7">
      <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[2.75rem]">
        {now?.time ?? "--:--:--"}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {now?.date ?? "···"} · Dhaka · UTC+06
      </p>
      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-sm bg-border/70"
        role="progressbar"
        aria-label="Percent of the Dhaka day elapsed"
        aria-valuenow={now?.pct ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-[width] duration-700 ease-out shadow-[0_0_12px_rgba(253,90,1,0.5)]"
          style={{ width: `${now?.pct ?? 0}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
        <span>00:00</span>
        <span>{now ? `day ${now.pct}%` : "day ·%"}</span>
        <span>24:00</span>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span aria-hidden="true" className="size-1.5 animate-blink bg-primary shadow-[0_0_6px_#fd5a01]" />
        Live · computed on your machine
      </div>
    </div>
  );
}

export {
  InstrumentCanvas,
  orbitInstrument,
  carrierInstrument,
  magnetInstrument,
  glyphInstrument,
};
