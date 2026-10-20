"use client";

import { useEffect, useRef } from "react";

/**
 * The Leak Board — the Problem section's live diagram.
 *
 * Six tools stand in a chain (dot-matrix labels), but the growth leaks
 * at the joints: ember drops escape between the boxes, fall and die on
 * the floor line. Pointer near a joint widens the leak; otherwise the
 * leak wanders joint to joint on its own. Everything is computed on
 * the visitor's machine: no video, no stock, no invented numbers.
 */

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  hot: number; // 0..1, brighter when pointer is near its joint
};

type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

const TOOLS = ["WEBSITE", "ADS", "ANALYTICS", "LEADS", "AI", "SHEETS"] as const;

// 5x7 dot font for A-Z 0-9, enough for the labels above.
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
};

function raster(text: string): boolean[][] {
  const cols = text.length * 6 - 1;
  const grid: boolean[][] = Array.from({ length: 7 }, () => Array(cols).fill(false));
  [...text].forEach((ch, i) => {
    const glyph = GLYPHS[ch];
    if (!glyph) return;
    glyph.forEach((row, y) => {
      [...row].forEach((bit, x) => {
        if (bit === "1") grid[y][i * 6 + x] = true;
      });
    });
  });
  return grid;
}

export function LeakBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;
    const cv: HTMLCanvasElement = canvas;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;

    const pointer = { x: -9999, y: -9999, inside: false };

    // Layout: chips spread across the width on the pipe line.
    type Chip = { label: string; grid: boolean[][]; x: number; y: number; w: number };
    let chips: Chip[] = [];
    let joints: { x: number; y: number }[] = [];
    const drop: Drop[] = [];
    const splashes: Splash[] = [];
    let activeJoint = 0;
    let jointTimer = 0;
    let time = 0;
    let cellSize = 3; // physical px per dot cell, set by layout()

    const CELL = 3; // logical px per dot cell at scale 1

    function layout(): void {
      // Fit-scale from the WIDEST row so every row fits, phones included.
      const baseCell = CELL * dpr;
      const grids = TOOLS.map((label) => raster(label));
      chips = TOOLS.map((label, index) => {
        const grid = grids[index];
        return { label, grid, x: 0, y: 0, w: grid[0].length * baseCell };
      });
      const twoRows = width < 640;
      const perRow = twoRows ? Math.ceil(chips.length / 2) : chips.length;
      let worstCells = 0;
      for (let row = 0; row < (twoRows ? 2 : 1); row += 1) {
        const rowChips = chips.slice(row * perRow, (row + 1) * perRow);
        const cells = rowChips.reduce((sum, chip) => sum + chip.grid[0].length, 0);
        if (cells > worstCells) worstCells = cells;
      }
      const gaps = perRow - 1;
      const scale = Math.max(0.4, Math.min(1, (width - 24 - gaps * 14) / (worstCells * baseCell)));
      const cell = baseCell * scale;
      cellSize = cell;
      chips.forEach((chip) => {
        chip.w = chip.grid[0].length * cell;
      });
      joints = [];
      for (let row = 0; row < (twoRows ? 2 : 1); row += 1) {
        const rowChips = chips.slice(row * perRow, (row + 1) * perRow);
        const y = twoRows ? (row === 0 ? 56 : 126) : PIPE_Y;
        const totalW = rowChips.reduce((sum, chip) => sum + chip.w, 0);
        const gap =
          rowChips.length > 1 ? Math.max(10, (width - 12 - totalW) / (rowChips.length - 1)) : 0;
        let cursor = 6;
        rowChips.forEach((chip) => {
          chip.x = cursor;
          chip.y = y;
          cursor += chip.w + gap;
        });
        for (let i = 0; i < rowChips.length - 1; i += 1) {
          joints.push({ x: rowChips[i].x + rowChips[i].w + gap / 2, y });
        }
      }
    }

    function resize(): void {
      const parent = cv.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, rect.width);
      height = 240;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    function spawnDrop(jointX: number, jointY: number, hot: number): void {
      drop.push({
        x: jointX + (Math.random() - 0.5) * 6,
        y: jointY + 6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 0.4 + Math.random() * 0.5,
        r: 1.2 + Math.random() * 1.4,
        life: 0,
        maxLife: 260,
        hot,
      });
    }

    function spawnSplash(x: number, hot: number): void {
      for (let i = 0; i < 5; i += 1) {
        splashes.push({
          x,
          y: FLOOR_Y - 2,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 1.6 - 0.4,
          life: 0,
        });
      }
      void hot;
    }

    const PIPE_Y = 74;
    const FLOOR_Y = 196;

    function step(): void {
      time += 1;

      // Leak scheduler: wander between joints on its own.
      jointTimer -= 1;
      if (jointTimer <= 0) {
        jointTimer = 210 + Math.random() * 260;
        activeJoint = Math.floor(Math.random() * joints.length);
      }

      // Pointer-near joints leak hard; the active joint drips slowly.
      joints.forEach((joint, index) => {
        const near =
          pointer.inside &&
          Math.abs(pointer.x - joint.x) < 70 &&
          Math.abs(pointer.y - joint.y) < 110;
        if (near && time % 4 === 0 && drop.length < 90) {
          spawnDrop(joint.x, joint.y, 1);
          if (Math.random() < 0.35) spawnDrop(joint.x + (Math.random() - 0.5) * 10, joint.y, 0.8);
        } else if (index === activeJoint && time % 22 === 0 && drop.length < 90) {
          spawnDrop(joint.x, joint.y, 0.45);
        }
      });

      // Physics.
      for (let i = drop.length - 1; i >= 0; i -= 1) {
        const d = drop[i];
        d.vy += 0.055;
        d.x += d.vx;
        d.y += d.vy;
        d.life += 1;
        if (d.y >= FLOOR_Y) {
          spawnSplash(d.x, d.hot);
          drop.splice(i, 1);
        } else if (d.life > d.maxLife) {
          drop.splice(i, 1);
        }
      }
      for (let i = splashes.length - 1; i >= 0; i -= 1) {
        const s = splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.life += 1;
        if (s.life > 26) splashes.splice(i, 1);
      }

      // ── Draw ──
      ctx.clearRect(0, 0, width, height);

      const cell = cellSize;

      // Pipe line: chain of tool chips.
      const pipeAlpha = 0.9;
      chips.forEach((chip, index) => {
        const grid = chip.grid;
        for (let y = 0; y < grid.length; y += 1) {
          for (let x = 0; x < grid[y].length; x += 1) {
            if (!grid[y][x]) continue;
            const flick = 0.72 + 0.28 * Math.sin(time * 0.02 + x * 0.35 + index * 2.1);
            ctx.fillStyle = `rgba(253, 90, 1, ${(0.5 * flick + 0.3) * pipeAlpha})`;
            ctx.fillRect(
              chip.x + x * cell,
              chip.y - (grid.length - y) * cell + (grid.length * cell) / 2,
              cell * 0.62,
              cell * 0.62,
            );
          }
        }
        // Connector to the next chip (leaks live in the gap).
        const next = chips[index + 1];
        // Connectors only join chips on the same pipe row.
        if (next && Math.abs(next.y - chip.y) < 1) {
          const y0 = chip.y - cell * 0.18;
          ctx.fillStyle = "rgba(253, 90, 1, 0.16)";
          ctx.fillRect(chip.x + chip.w, y0, next.x - (chip.x + chip.w), cell * 0.36);
          // Joint marker.
          const jx = (chip.x + chip.w + next.x) / 2;
          const pulse = 0.35 + 0.25 * Math.sin(time * 0.05 + index);
          ctx.beginPath();
          ctx.arc(jx, chip.y, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 120, 40, ${pulse + 0.25})`;
          ctx.fill();
        }
      });

      // Drops.
      drop.forEach((d) => {
        const a = Math.max(0, 1 - d.life / d.maxLife) * (0.55 + 0.45 * d.hot);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (0.8 + 0.4 * d.hot), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.round(120 + 90 * d.hot)}, 40, ${a})`;
        ctx.fill();
      });

      // Splashes.
      splashes.forEach((s) => {
        const a = Math.max(0, 1 - s.life / 26) * 0.5;
        ctx.fillStyle = `rgba(253, 90, 1, ${a})`;
        ctx.fillRect(s.x, s.y, 1.6, 1.6);
      });

      // Floor: the "lost" line, dashed, with warm puddle glow.
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = "rgba(253, 90, 1, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y + 0.5);
      ctx.lineTo(width, FLOOR_Y + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = "rgba(253, 90, 1, 0.4)";
      ctx.fillText("LOST BETWEEN TOOLS", 8, FLOOR_Y + 14);

      // Caption chip: live dot.
      ctx.fillStyle = `rgba(74, 222, 128, ${0.5 + 0.3 * Math.sin(time * 0.08)})`;
      ctx.beginPath();
      ctx.arc(width - 12, 14, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(): void {
      if (!running) return;
      if (visible && !reduced) step();
      raf = requestAnimationFrame(frame);
    }

    function reducedFrame(): void {
      // One honest still frame: chips, pipe, no motion.
      time = 30;
      step();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    observer.observe(cv);

    const resizer = new ResizeObserver(() => {
      resize();
      if (reduced) reducedFrame();
    });
    resizer.observe(cv.parentElement ?? cv);

    const onPointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.inside = true;
    };
    const onPointerLeave = (): void => {
      pointer.inside = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    cv.addEventListener("pointermove", onPointerMove);
    cv.addEventListener("pointerleave", onPointerLeave);

    resize();
    if (reduced) {
      reducedFrame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizer.disconnect();
      cv.removeEventListener("pointermove", onPointerMove);
      cv.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/40">
      <canvas ref={canvasRef} className="block w-full" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          FIG · THE SPACE IN BETWEEN
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
          Live, not stock. Move the pointer over a joint.
        </p>
      </div>
    </div>
  );
}
