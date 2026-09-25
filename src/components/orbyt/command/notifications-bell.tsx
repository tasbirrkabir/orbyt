"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";
import { formatAge } from "@/lib/portal/domain";
import type { NotificationsPayload } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * The notification center: unread count on the bell, the latest items
 * in a popover, mark-all-read, and deep links that actually navigate.
 * Fetched lazily and quietly; a failure just shows an empty tray.
 */
export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<NotificationsPayload | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/portal/notifications");
      if (response.ok) setPayload((await response.json()) as NotificationsPayload);
    } catch {
      // The tray stays as-is; the next open retries.
    }
  }, []);

  useEffect(() => {
    // One deferred frame: the fetch is external-system sync, not render sync.
    const raf = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [load]);

  const markAll = async () => {
    try {
      await fetch("/api/portal/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setPayload((current) =>
        current
          ? { ...current, items: current.items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })), unread: 0 }
          : current,
      );
    } catch {
      // Non-fatal: unread count comes back on next open.
    }
  };

  const unread = payload?.unread ?? 0;

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) void load(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={unread > 0 ? COMMAND.shell.notifications.unreadAria(unread) : COMMAND.shell.notifications.label}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unread > 0 ? (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold text-[#1B1B1A]"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-border bg-popover p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {COMMAND.shell.notifications.label}
          </p>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => void markAll()}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
            >
              {COMMAND.shell.notifications.markAll}
            </button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!payload || payload.items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              {COMMAND.shell.notifications.empty}
            </p>
          ) : (
            <ul role="list">
              {payload.items.slice(0, 8).map((item) => (
                <li key={item.id} className="border-b border-border/60 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (item.link) router.push(item.link);
                    }}
                    className={cn(
                      "block w-full px-4 py-3 text-left transition-colors hover:bg-accent",
                      !item.readAt && "bg-primary/[0.04]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {!item.readAt ? (
                        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
                      ) : (
                        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-transparent" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {formatAge(item.createdAt)}
                      </span>
                    </span>
                    {item.body ? (
                      <span className="mt-1 block pl-3.5 text-xs leading-relaxed text-muted-foreground">
                        {item.body}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
