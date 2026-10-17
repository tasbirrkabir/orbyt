"use client";

import { useEffect, useRef, useState } from "react";

/* ── Orbyt · Field-notes live cards ────────────────────────
   Client leaves of the manifesto wall: a ticking studio clock
   pinned to Asia/Dhaka and a canvas signal wave. Both pause
   offscreen and go static under reduced motion. */

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function StudioClock() {
  const [now, setNow] = useState<{ time: string; date: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow({ time: timeFmt.format(d), date: dateFmt.format(d).toUpperCase() });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-foreground sm:text-5xl">
        {now?.time ?? "--:--:--"}
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {now?.date ?? "···"} · ASIA/DHAKA
      </p>
      <div className="mt-auto flex items-center gap-2 pt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        <span aria-hidden="true" className="size-1.5 animate-blink bg-primary" />
        OPEN · 09.00 – 19.00
      </div>
    </div>
  );
}

export function SignalWave({ className }: { className?: string }) {
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
    let cell = 8;
    let t = 0;
    let last = performance.now();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(7, Math.round(W / 34));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mid = H * 0.52;
      const amp = H * 0.3;
      for (let x = cell / 2; x < W; x += cell) {
        const phase = x / W;
        const y =
          mid +
          amp * Math.sin(phase * 6.5 + t * 2.2) * Math.sin(phase * 1.7 - t * 0.7);
        const b = 0.55 + 0.45 * Math.sin(phase * 9 - t * 3);
        /* halo */
        ctx.globalAlpha = 0.16 * b;
        ctx.fillStyle = "#fd5a01";
        ctx.fillRect(x - cell * 0.75, y - cell * 0.75, cell * 1.5, cell * 1.5);
        /* core */
        ctx.globalAlpha = Math.min(1, 0.5 + 0.5 * b);
        ctx.fillStyle = b > 0.8 ? "#ffc987" : "#fd5a01";
        const core = Math.max(2, cell * 0.42);
        ctx.fillRect(x - core / 2, y - core / 2, core, core);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      draw();
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
      if (reduced) draw();
    });
    ro.observe(canvas);

    if (reduced) {
      draw();
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => (en.isIntersecting ? start() : stop())),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
