"use client";

import { useEffect, useRef, useState } from "react";
import { displayFontFamily } from "./pixel-sign-404";

/* ── Orbyt · Console instruments ───────────────────────────
   The gallery without photographs: five live instruments,
   each drawn by code on the visitor's machine. Shared
   harness handles DPR, resize, offscreen pausing, pointer
   tracking and reduced-motion stills; each instrument only
   describes how it moves. */

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
    const ctx = canvas.getContext("2d");
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
        /* A broken instrument must not take the whole rAF loop down. */
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

/* 01 — the orbit: rings, satellites, a pulsing core. */
const orbitInstrument: Factory = () => ({
  step: ({ ctx, W, H, t, hover }) => {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H * 0.55;
    const speed = hover ? 1.9 : 1;
    const R = Math.min(W * 0.42, H * 0.42);
    const rings = [R * 0.52, R];

    ctx.fillStyle = "#fd5a01";
    rings.forEach((r, ri) => {
      const n = Math.max(28, Math.floor((TAU * r) / 15));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        const dash = 0.5 + 0.5 * Math.sin(a * 10 + ri * 2 + t * 0.8);
        ctx.globalAlpha = 0.18 + 0.2 * dash;
        ctx.fillRect(cx + Math.cos(a) * r - 1.1, cy + Math.sin(a) * r * 0.9 - 1.1, 2.2, 2.2);
      }
    });

    const sats = [
      { r: rings[1], sp: 0.55, ph: 0.4 },
      { r: rings[1], sp: -0.38, ph: 2.6 },
      { r: rings[0], sp: 0.95, ph: 1.8 },
    ];
    for (const s of sats) {
      const a = s.ph + t * s.sp * speed;
      for (let k = 5; k >= 1; k--) {
        const a2 = a - Math.sign(s.sp) * k * 0.055;
        ctx.globalAlpha = 0.34 * (1 - k / 6);
        ctx.fillRect(
          cx + Math.cos(a2) * s.r - 1.2,
          cy + Math.sin(a2) * s.r * 0.9 - 1.2,
          2.4,
          2.4
        );
      }
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "#ffc987";
      ctx.fillRect(cx + Math.cos(a) * s.r - 1.8, cy + Math.sin(a) * s.r * 0.9 - 1.8, 3.6, 3.6);
      ctx.fillStyle = "#fd5a01";
    }

    const pulse = 1 + 0.07 * Math.sin(t * 2.2);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.36 * pulse);
    g.addColorStop(0, hover ? "rgba(255,178,92,0.5)" : "rgba(255,178,92,0.32)");
    g.addColorStop(1, "rgba(253,90,1,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(cx - R * 0.4, cy - R * 0.4, R * 0.8, R * 0.8);
    ctx.fillStyle = "#fd5a01";
    ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
    ctx.globalAlpha = 1;
  },
});

/* 02 — the carrier: drops of work, falling in columns. */
const carrierInstrument: Factory = () => {
  let cols: { x: number; y: number; sp: number; gap: number; a: number }[] = [];
  return {
    build: (W) => {
      cols = [];
      const cw = Math.max(12, W / 26);
      for (let x = cw / 2; x < W; x += cw) {
        cols.push({
          x,
          y: Math.random() * 400,
          sp: 16 + Math.random() * 52,
          gap: 9,
          a: 0.34 + Math.random() * 0.52,
        });
      }
    },
    step: ({ ctx, W, H, t, dt, hover }) => {
      ctx.clearRect(0, 0, W, H);
      const boost = hover ? 1.7 : 1;
      for (const c of cols) {
        c.y += c.sp * boost * dt;
        if (c.y - 6 * c.gap > H) {
          c.y = -Math.random() * H * 0.4;
          c.sp = 16 + Math.random() * 52;
          c.a = 0.34 + Math.random() * 0.52;
        }
        for (let k = 0; k < 6; k++) {
          const y = c.y - k * c.gap;
          if (y < -4 || y > H + 4) continue;
          const a = (k === 0 ? 1 : 0.62 * (1 - k / 6.5)) * c.a;
          ctx.globalAlpha = Math.min(1, a);
          ctx.fillStyle =
            k === 0 && Math.sin(t * 3 + c.x) > 0.55 ? "#ffc987" : "#fd5a01";
          const sz = k === 0 ? 3 : 2;
          ctx.fillRect(c.x - sz / 2, y - sz / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    },
  };
};

/* 03 — the pull: a lattice that leans toward the pointer. */
const magnetInstrument: Factory = () => {
  let dots: { hx: number; hy: number; x: number; y: number }[] = [];
  return {
    build: (W, H) => {
      dots = [];
      const s = Math.max(15, Math.min(W, H) / 14);
      for (let y = s * 0.9; y < H; y += s) {
        for (let x = s * 0.7; x < W; x += s) {
          dots.push({ hx: x, hy: y, x, y });
        }
      }
    },
    step: ({ ctx, H, W, t, dt, pointer }) => {
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.6;
      const sigma2 = 2 * R * R * 0.3;
      ctx.fillStyle = "#fd5a01";
      for (const d of dots) {
        const bx = d.hx + Math.sin(t * 1.2 + (d.hx + d.hy) * 0.02) * 1.2;
        const by = d.hy + Math.cos(t * 1.1 + (d.hx - d.hy) * 0.02) * 1.2;
        let tx = bx;
        let ty = by;
        let pull = 0;
        if (pointer) {
          const dx = pointer.x - d.hx;
          const dy = pointer.y - d.hy;
          const dist = Math.hypot(dx, dy);
          pull = Math.exp(-(dist * dist) / sigma2);
          if (pull > 0.02 && dist > 0.001) {
            const f = Math.min(dist * 0.55, R * 0.45) * pull;
            tx += (dx / dist) * f;
            ty += (dy / dist) * f;
          }
        }
        const k = Math.min(1, dt * 8);
        d.x += (tx - d.x) * k;
        d.y += (ty - d.y) * k;
        ctx.globalAlpha = Math.min(0.95, 0.3 + 0.6 * pull);
        const sz = 1.7 + 2.4 * pull;
        ctx.fillRect(d.x - sz / 2, d.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    },
  };
};

/* 04 — the name: a dot-matrix sign cycling the vocabulary. */
const WORDS = ["ORBYT", "BUILD", "SHIP", "MOVE"] as const;

const glyphInstrument: Factory = () => {
  let masks: Set<string>[] = [];
  let cell = 8;
  let gw = 0;
  let gh = 0;
  let oy = 0;

  return {
    build: (W, H) => {
      cell = Math.max(5, Math.min(11, W / 24));
      gw = Math.floor(W / cell);
      gh = Math.floor((H * 0.6) / cell);
      oy = Math.floor((H - gh * cell) / 2 / cell);
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d");
      if (!octx) {
        masks = [];
        return;
      }
      const family = displayFontFamily();
      masks = WORDS.map((word) => {
        octx.fillStyle = "#000";
        octx.fillRect(0, 0, gw, gh);
        octx.fillStyle = "#fff";
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        octx.font = `900 ${Math.round(Math.min(gh * 0.92, gw * 0.28))}px ${family}`;
        octx.fillText(word, gw / 2, gh / 2);
        const data = octx.getImageData(0, 0, gw, gh).data;
        const set = new Set<string>();
        for (let y = 0; y < gh; y++) {
          for (let x = 0; x < gw; x++) {
            if (data[(y * gw + x) * 4] > 110) set.add(`${x},${y}`);
          }
        }
        return set;
      });
    },
    step: ({ ctx, W, H, t }) => {
      ctx.clearRect(0, 0, W, H);
      if (masks.length !== WORDS.length) return;
      const dur = 2.6;
      const idx = Math.floor(t / dur) % WORDS.length;
      const ph = (t % dur) / dur;
      const bw = ph < 0.86 ? 0 : (ph - 0.86) / 0.14;
      const w = bw * bw * (3 - 2 * bw);
      const A = masks[idx];
      const B = masks[(idx + 1) % WORDS.length];
      if (!A || !B) return;
      const sz = Math.max(1.6, cell * 0.5);

      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const key = `${x},${y}`;
          const aA = A.has(key) ? 1 : 0;
          const aB = B.has(key) ? 1 : 0;
          const a = aA * (1 - w) + aB * w;
          if (a <= 0.04) continue;
          const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          const b = a * (0.74 + 0.26 * Math.sin(t * (2 + h * 5) + h * TAU));
          ctx.globalAlpha = Math.min(1, b);
          ctx.fillStyle = b > 0.85 ? "#ffc987" : "#fd5a01";
          ctx.fillRect((x + 0.5) * cell - sz / 2, (oy + y + 0.5) * cell - sz / 2, sz, sz);
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

/* 05 — the clock: Dhaka time, day progress, always on. */
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
      <p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-foreground sm:text-[2.75rem]">
        {now?.time ?? "--:--:--"}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {now?.date ?? "···"} · Dhaka · UTC+06
      </p>
      <div
        className="mt-4 h-1 w-full overflow-hidden rounded-sm bg-border/70"
        role="progressbar"
        aria-label="Percent of the Dhaka day elapsed"
        aria-valuenow={now?.pct ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${now?.pct ?? 0}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
        <span>00:00</span>
        <span>{now ? `day ${now.pct}%` : "day ·%"}</span>
        <span>24:00</span>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
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
