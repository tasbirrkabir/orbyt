"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";

/* ── Orbyt · Press Any Key ─────────────────────────────────
   A rebuilt mechanical keycap wired to a real listener: press
   ANY key on the keyboard (or tap the cap) and the switch
   bottoms out, the label stamps the key you hit, and you're
   navigated home. Pure CSS depth — no assets. */

const IGNORED = new Set([
  "Tab",
  "Shift",
  "Control",
  "Meta",
  "Alt",
  "CapsLock",
  "NumLock",
  "ScrollLock",
  "ContextMenu",
]);

const PRETTY: Record<string, string> = {
  " ": "SPACE",
  Escape: "ESC",
  Enter: "ENTER",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Backspace: "⌫",
  Delete: "DEL",
  Home: "HOME",
  End: "END",
  PageUp: "PG UP",
  PageDown: "PG DN",
};

function prettyKey(key: string): string {
  if (PRETTY[key]) return PRETTY[key];
  if (/^F\d{1,2}$/.test(key)) return key;
  if (key.length === 1) return key.toUpperCase();
  return key.toUpperCase().slice(0, 6);
}

export function PressAnyKey({
  href = "/",
  hint,
  alt,
}: {
  href?: string;
  hint?: string;
  alt?: string;
}) {
  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const armed = useRef(true);

  const fire = useCallback(
    (label: string) => {
      if (!armed.current) return;
      armed.current = false;
      setPressed(label);
      setDown(true);
      window.setTimeout(() => router.push(href), 520);
    },
    [href, router]
  );

  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (IGNORED.has(e.key)) return;
      if (/^F\d{1,2}$/.test(e.key)) return;
      if (isTyping(e.target)) return;
      e.preventDefault();
      fire(prettyKey(e.key));
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fire]);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {hint ?? "Press any key to go home"}
      </p>

      <button
        type="button"
        aria-label="Press any key to return to the homepage"
        onPointerDown={() => setDown(true)}
        onPointerUp={() => {
          if (armed.current) setDown(false);
        }}
        onPointerLeave={() => {
          if (armed.current) setDown(false);
        }}
        onClick={() => fire("ANY")}
        className="group relative select-none focus-visible:outline-none"
      >
        {/* Key body: CSS 3D depth via layered shadows */}
        <span
          aria-hidden="true"
          className={[
            "absolute inset-x-3 -bottom-3 h-6 rounded-b-2xl bg-[#7a2c00] transition-all duration-150",
            down ? "bottom-1 h-3 opacity-70" : "",
          ].join(" ")}
        />
        <span
          className={[
            "relative flex h-20 w-56 flex-col items-center justify-center rounded-2xl border border-[#ffb25c]/40 bg-gradient-to-b from-[#ff8a3d] via-[#fd5a01] to-[#d64f01] shadow-[0_14px_30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform duration-150 ease-out sm:h-24 sm:w-72",
            down ? "translate-y-[9px] shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]" : "group-hover:translate-y-[2px]",
          ].join(" ")}
        >
          <span className="flex items-center gap-2.5 font-display text-xl font-bold tracking-[0.18em] text-[#1b1b1a] sm:text-2xl">
            <Keyboard aria-hidden="true" className="size-5 sm:size-6" strokeWidth={2.4} />
            {pressed ?? "ANY KEY"}
          </span>
          <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#5c2500]">
            {pressed ? "snapping back…" : "mechanical · orbyt switch"}
          </span>
        </span>
      </button>

      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
        {alt ?? "No keyboard? Tap the key."}
      </p>

      {/* Bottom-out flash */}
      {down ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 animate-in fade-in duration-300 bg-primary/10"
        />
      ) : null}
    </div>
  );
}
