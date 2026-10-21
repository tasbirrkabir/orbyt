"use client";

import { useEffect, useRef, useState } from "react";
import {
  HORSE_FRAME_COUNT,
  HORSE_FRAME_HEIGHT,
  HORSE_FRAME_WIDTH,
  MUYBRIDGE_ASCII_FRAMES,
} from "./horse-frames";

/* ── Orbyt · Authentic 1878 Muybridge ASCII Galloping Horse ───
   Historic motion study: Eadweard Muybridge's "The Horse in Motion" (1878).
   Rendered in high-definition terminal ASCII typography with multi-tone
   CRT phosphor glow, hoof-strike telemetry, and wind ember dynamics.
*/

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

const PALETTES = [
  {
    name: "ORBYT EMBER",
    core: "#fff8f0",
    coreGlow: "#fd5a01",
    mid: "#fd5a01",
    midGlow: "rgba(253,90,1,0.45)",
    outer: "#cc4400",
    edge: "#8a2c00",
    track: "rgba(253,90,1,0.35)",
    telemetry: "#fd5a01",
  },
  {
    name: "PHOENIX GOLD",
    core: "#ffffff",
    coreGlow: "#ffbb33",
    mid: "#ffaa00",
    midGlow: "rgba(255,170,0,0.45)",
    outer: "#cc7700",
    edge: "#884400",
    track: "rgba(255,170,0,0.35)",
    telemetry: "#ffaa00",
  },
  {
    name: "CRT GREEN",
    core: "#f0fff4",
    coreGlow: "#00ff66",
    mid: "#00ee55",
    midGlow: "rgba(0,238,85,0.45)",
    outer: "#009933",
    edge: "#00551e",
    track: "rgba(0,238,85,0.35)",
    telemetry: "#00ee55",
  },
];

export function EmberHorse({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paletteIndex, setPaletteIndex] = useState(0);

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

    let frameProgress = 0;
    let currentFrame = 0;
    let speed = 1.0;
    const targetSpeed = { current: 1.0 };
    let lastTime = performance.now();
    let sparks: Spark[] = [];
    let groundScroll = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (dt: number) => {
      // Smooth pace acceleration
      speed += (targetSpeed.current - speed) * Math.min(1, dt * 5);
      
      // Zoopraxiscope rate: ~13 fps at base speed (up to 24 fps on sprint)
      const fps = 13.5 * speed;
      frameProgress += dt * fps;
      currentFrame = Math.floor(frameProgress) % HORSE_FRAME_COUNT;

      ctx.clearRect(0, 0, W, H);

      const pal = PALETTES[paletteIndex % PALETTES.length];

      // Sizing typography grid to fit within canvas cleanly
      // 47 columns x 32 rows
      const marginX = W * 0.08;
      const marginY = H * 0.12;
      const availW = W - marginX * 2;
      const availH = H - marginY * 2;

      // Monospace aspect ratio is typically ~0.6 (width/height)
      const charH = Math.min(availH / HORSE_FRAME_HEIGHT, (availW / HORSE_FRAME_WIDTH) / 0.58);
      const charW = charH * 0.58;

      const gridW = HORSE_FRAME_WIDTH * charW;
      const gridH = HORSE_FRAME_HEIGHT * charH;
      const startX = (W - gridW) / 2;
      const startY = (H - gridH) / 2 + charH * 0.2;

      const groundY = startY + gridH + 2;

      // Ground track with moving tick marks
      groundScroll += dt * speed * 220;
      ctx.fillStyle = pal.track;
      for (let x = -(groundScroll % 24); x < W; x += 24) {
        ctx.fillRect(x, groundY, 12, 1.5);
      }
      ctx.fillRect(0, groundY + 4, W, 0.5);

      // Subtle ambient ground reflection
      const grad = ctx.createLinearGradient(0, groundY, 0, Math.min(H, groundY + 30));
      grad.addColorStop(0, pal.midGlow);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY + 4, W, 26);

      // Spawn wind ember sparks detached from mane and tail
      if (Math.random() < 0.45 * speed) {
        const isTail = Math.random() < 0.6;
        const spawnX = isTail ? startX + gridW * 0.2 : startX + gridW * 0.7;
        const spawnY = startY + gridH * (0.3 + Math.random() * 0.3);
        sparks.push({
          x: spawnX,
          y: spawnY,
          vx: -60 - Math.random() * 120 * speed,
          vy: (Math.random() - 0.4) * 35,
          life: 0,
          max: 0.6 + Math.random() * 0.8,
          size: 1.4 + Math.random() * 1.8,
          color: Math.random() > 0.4 ? pal.core : pal.mid,
        });
      }

      // Hoof impact sparks when hooves reach near ground
      if (currentFrame === 0 || currentFrame === 5 || currentFrame === 10) {
        if (Math.random() < 0.5) {
          const hoofX = startX + gridW * (0.35 + Math.random() * 0.4);
          for (let k = 0; k < 2; k++) {
            sparks.push({
              x: hoofX,
              y: groundY,
              vx: -40 - Math.random() * 80,
              vy: -20 - Math.random() * 40,
              life: 0,
              max: 0.4 + Math.random() * 0.4,
              size: 1.2 + Math.random() * 1.5,
              color: pal.mid,
            });
          }
        }
      }

      // Draw active sparks
      sparks = sparks.filter((s) => s.life < s.max);
      for (const s of sparks) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 60 * dt; // gravity
        const alpha = Math.sin((s.life / s.max) * Math.PI);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.globalAlpha = 1;

      // Draw ASCII Horse Grid
      const frameLines = MUYBRIDGE_ASCII_FRAMES[currentFrame];
      if (frameLines) {
        ctx.font = `bold ${Math.floor(charH)}px "JetBrains Mono", "Courier New", monospace`;
        ctx.textBaseline = "top";

        for (let row = 0; row < HORSE_FRAME_HEIGHT; row++) {
          const line = frameLines[row];
          if (!line) continue;

          for (let col = 0; col < HORSE_FRAME_WIDTH; col++) {
            const ch = line[col];
            if (!ch || ch === " ") continue;

            const x = startX + col * charW;
            const y = startY + row * charH;

            if (ch === "#") {
              // Core: High incandescent white-amber with electric bloom
              ctx.shadowColor = pal.coreGlow;
              ctx.shadowBlur = 8;
              ctx.fillStyle = pal.core;
              ctx.fillText(ch, x, y);
            } else if (ch === "*") {
              // Mid muscle: Electric signature orange
              ctx.shadowColor = pal.midGlow;
              ctx.shadowBlur = 5;
              ctx.fillStyle = pal.mid;
              ctx.fillText(ch, x, y);
            } else if (ch === "+") {
              // Outer contour: Deep amber
              ctx.shadowBlur = 0;
              ctx.fillStyle = pal.outer;
              ctx.fillText(ch, x, y);
            } else {
              // Edge / Hoof / Ear tip: Soft phosphor
              ctx.shadowBlur = 0;
              ctx.fillStyle = pal.edge;
              ctx.fillText(ch, x, y);
            }
          }
        }
        ctx.shadowBlur = 0;
      }

      // CRT Scanlines (subtle 1px horizontal overlay every 3px)
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      // Corner HUD Telemetry
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(255,255,255,0.4)";

      // Top-Left: Motion study plate
      ctx.fillText(`PLATE 626 // MUYBRIDGE 1878`, 16, 20);

      // Top-Right: Current frame / Total
      const frameStr = `FRAME ${String(currentFrame + 1).padStart(2, "0")}/${HORSE_FRAME_COUNT} · ${(speed * 13.5).toFixed(1)} FPS`;
      ctx.fillText(frameStr, W - ctx.measureText(frameStr).width - 16, 20);

      // Bottom-Left: Color mode
      ctx.fillText(`MODE: ASCII MATRIX [${pal.name}]`, 16, H - 14);

      // Bottom-Right: Hover prompt
      const hintStr = speed > 1.2 ? "HIGH VELOCITY SPRINT" : "HOVER TO SPRINT · CLICK PALETTE";
      ctx.fillStyle = speed > 1.2 ? pal.mid : "rgba(255,255,255,0.4)";
      ctx.fillText(hintStr, W - ctx.measureText(hintStr).width - 16, H - 14);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    build();

    const onEnter = () => {
      targetSpeed.current = 1.85; // Accelerate on hover
    };
    const onLeave = () => {
      targetSpeed.current = 1.0;
    };
    const onClick = () => {
      setPaletteIndex((prev) => (prev + 1) % PALETTES.length);
    };

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

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
        canvas.removeEventListener("click", onClick);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !running) {
            running = true;
            lastTime = performance.now();
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
      canvas.removeEventListener("click", onClick);
    };
  }, [paletteIndex]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-full w-full cursor-pointer"}
      role="img"
      aria-label="Authentic Eadweard Muybridge 1878 galloping horse ASCII art animation rendered live in code"
    />
  );
}
