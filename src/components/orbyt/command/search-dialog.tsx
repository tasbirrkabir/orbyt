"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { COMMAND } from "@/content/command";
import type { SearchPayload } from "@/lib/portal/types";

/**
 * Global search: one dialog, every resource the client can see.
 * Results come from org-scoped queries server-side, so a term only
 * ever matches the caller's own tenant. Filtering happens on the
 * server (shouldFilter stays off client-side); the input is debounced
 * and needs two characters.
 */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [payload, setPayload] = useState<SearchPayload | null>(null);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const termRef = useRef("");
  useEffect(() => {
    if (!open) return;
    const trimmed = term.trim();
    termRef.current = trimmed;
    if (trimmed.length < 2) return;
    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/portal/search?q=${encodeURIComponent(trimmed)}`);
        if (response.ok && termRef.current === trimmed) {
          setPayload((await response.json()) as SearchPayload);
        }
      } catch {
        // Keep whatever results are already shown; the next keystroke retries.
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [term, open]);

  const go = useCallback((href: string) => {
    setOpen(false);
    setTerm("");
    setPayload(null);
    router.push(href);
  }, [router]);

  const groups = term.trim().length >= 2 ? payload?.groups ?? [] : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 border border-input bg-background/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={COMMAND.shell.search.label}
      >
        <span aria-hidden="true" className="text-muted-foreground">⌕</span>
        <span className="hidden sm:inline">{COMMAND.shell.search.short}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>{COMMAND.shell.search.label}</DialogTitle>
          <DialogDescription>{COMMAND.shell.search.hint}</DialogDescription>
        </DialogHeader>
        <DialogContent className="overflow-hidden border-border bg-popover p-0 sm:max-w-lg">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={COMMAND.shell.search.placeholder}
              value={term}
              onValueChange={setTerm}
            />
            <CommandList className="max-h-80">
              {groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.items.map((item) => (
                    <CommandItem key={item.href + item.id} value={item.title} onSelect={() => go(item.href)}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {term.trim().length >= 2 && payload !== null && groups.length === 0 ? (
                <CommandEmpty>{COMMAND.shell.search.empty}</CommandEmpty>
              ) : null}
              {term.trim().length < 2 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  {COMMAND.shell.search.hint}
                </p>
              ) : null}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
