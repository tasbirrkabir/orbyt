"use client";

import { useEffect, useRef } from "react";

/* ── Orbyt · Pixel Sign 404 ────────────────────────────────
   The "signal lost" plate, rebuilt entirely in code. Text is
   rasterized to a low-res mask, then re-drawn as a grid of
   glowing ember dots — per-dot flicker, occasional power dips
   and floating embers, like a neon sign running on old wiring.
   No image anywhere: every dot is computed. */

type SignDot = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  /** Dim base so the sign has depth instead of uniform brightness. */
  base: number;
  dead: boolean;
  deadUntil: number;
};

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
};

let cachedFont: string | null = null;

/** Read the rendered display font so code-drawn text matches the brand face. */
export function displayFontFamily(): string {
  if (cachedFont) return cachedFont;
  if (typeof document === "undefined") return "system-ui, sans-serif";
  const probe = document.createElement("span");
  probe.className = "font-display";
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  cachedFont = getComputedStyle(probe).fontFamily || "system-ui, sans-serif";
  probe.remove();
  return cachedFont;
}

export function PixelSign404({ className }: { className?: string }) {
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
    let dots: SignDot[] = [];
    let embers: Ember[] = [];
    let glowSprite: HTMLCanvasElement | null = null;
    let spriteSize = 0;
    let cell = 6;
    let t = 0;
    let last = performance.now();
    let nextDip = 2.5 + Math.random() * 3;
    let dipUntil = -1;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Low-res raster: each mask pixel becomes one LED dot. */
      cell = Math.max(5, Math.round(W / 96));
      const gw = Math.floor(W / cell);
      const gh = Math.floor(H / cell);
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.fillStyle = "#000";
      octx.fillRect(0, 0, gw, gh);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      const family = displayFontFamily();
      octx.font = `900 ${Math.round(gh * 0.66)}px ${family}`;
      octx.fillText("404", gw / 2, gh * 0.4);
      octx.font = `700 ${Math.max(6, Math.round(gh * 0.15))}px ${family}`;
      (octx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
        `${Math.max(1, Math.round(gw * 0.012))}px`;
      octx.fillText("NOT FOUND", gw / 2, gh * 0.8);

      const data = octx.getImageData(0, 0, gw, gh).data;
      dots = [];
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const a = data[(y * gw + x) * 4];
          if (a > 110) {
            dots.push({
              x: (x + 0.5) * cell,
              y: (y + 0.5) * cell,
              phase: Math.random() * Math.PI * 2,
              speed: 1.2 + Math.random() * 2.6,
              base: 0.62 + Math.random() * 0.38,
              dead: false,
              deadUntil: 0,
            });
          }
        }
      }

      /* Soft radial glow sprite shared by all dots (fast drawImage). */
      spriteSize = Math.ceil(cell * 3.4);
      const sprite = document.createElement("canvas");
      sprite.width = spriteSize;
      sprite.height = spriteSize;
      const sctx = sprite.getContext("2d");
      if (sctx) {
        const g = sctx.createRadialGradient(
          spriteSize / 2,
          spriteSize / 2,
          0,
          spriteSize / 2,
          spriteSize / 2,
          spriteSize / 2
        );
        g.addColorStop(0, "rgba(255,178,92,0.85)");
        g.addColorStop(0.32, "rgba(253,90,1,0.5)");
        g.addColorStop(1, "rgba(253,90,1,0)");
        sctx.fillStyle = g;
        sctx.fillRect(0, 0, spriteSize, spriteSize);
      }
      glowSprite = sprite;

      embers = Array.from({ length: Math.min(26, Math.round(W / 40)) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: -2 - Math.random() * 6,
        vy: -6 - Math.random() * 12,
        life: 0,
        maxLife: 2 + Math.random() * 2.4,
        r: 0.8 + Math.random() * 1.4,
      }));
    };

    const emberColor = (a: number) =>
      `rgba(255,${Math.round(138 + 60 * a)},${Math.round(40 + 40 * a)},${a})`;

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, W, H);

      /* Faulty-neon power dip: brief double-blink every few seconds. */
      if (t >= nextDip) {
        dipUntil = t + 0.28;
        nextDip = t + 5 + Math.random() * 5;
      }
      let dim = 1;
      if (t < dipUntil) {
        const k = (dipUntil - t) / 0.28;
        dim = 0.22 + 0.5 * Math.abs(Math.sin(k * Math.PI * 3));
      }

      if (!glowSprite) return;

      /* Sign dots */
      for (const d of dots) {
        if (!d.dead && Math.random() < 0.00016 * dt * 60) {
          d.dead = true;
          d.deadUntil = t + 0.08 + Math.random() * 0.3;
        }
        if (d.dead && t >= d.deadUntil) d.dead = false;

        const flick = 0.78 + 0.22 * Math.sin(t * d.speed + d.phase);
        let b = d.base * flick * dim;
        if (d.dead) b *= 0.14;

        ctx.globalAlpha = Math.min(1, b);
        ctx.drawImage(
          glowSprite,
          d.x - spriteSize / 2,
          d.y - spriteSize / 2
        );
        /* Hot pixel core */
        ctx.globalAlpha = Math.min(1, b * 1.5);
        ctx.fillStyle = b > 0.66 ? "#ffc987" : b > 0.35 ? "#fd5a01" : "#8f3401";
        const core = Math.max(1.4, cell * 0.56);
        ctx.fillRect(d.x - core / 2, d.y - core / 2, core, core);
      }

      /* Floating embers drifting up-left like sparks off the sign */
      for (const e of embers) {
        e.life += dt;
        if (e.life > e.maxLife) {
          e.life = 0;
          e.maxLife = 2 + Math.random() * 2.4;
          e.x = W * (0.3 + Math.random() * 0.7);
          e.y = H * (0.55 + Math.random() * 0.5);
          e.vx = -2 - Math.random() * 6;
          e.vy = -6 - Math.random() * 12;
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        const a = Math.sin((e.life / e.maxLife) * Math.PI) * 0.85 * dim;
        ctx.globalAlpha = 1;
        ctx.fillStyle = emberColor(a);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
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
    if (reduced) {
      /* One composed static frame. */
      draw(0.016);
    } else {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())),
        { threshold: 0.05 }
      );
      io.observe(canvas);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduced) draw(0.016);
    });
    ro.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
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
