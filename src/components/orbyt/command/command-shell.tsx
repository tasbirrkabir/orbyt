"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/content/command";
import { ROLE_LABELS } from "@/lib/portal/domain";
import type { PortalIdentity } from "@/lib/portal/types";
import { ConsoleFrame } from "@/components/orbyt/dashboard/console-frame";
import { PortalGate } from "@/components/orbyt/portal/portal-gate";
import { navItems } from "./command-nav";
import { cn } from "@/lib/utils";

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {COMMAND.states.loading}
      </p>
    </div>
  );
}

function NavLink({
  item,
  active,
  onSelect,
  className,
}: {
  item: { label: string; href: string; key: string };
  active: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {/* Ember tick: the active marker is structural, not decorative. */}
      <span
        aria-hidden="true"
        className={cn(
          "h-px w-3 shrink-0 transition-colors",
          active ? "bg-primary" : "bg-border group-hover:bg-muted-foreground",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/**
 * The Command Center shell. Locked sessions render the gate in place;
 * live sessions render the console plate with a persistent sidebar
 * (desktop), a drawer (mobile) and the account block. Three rooms,
 * zero redirects anywhere in the flow.
 */
export function CommandShell({ children }: { children: ReactNode }) {
  const { status, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [identity, setIdentity] = useState<PortalIdentity | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/portal/identity");
        if (response.ok && active) setIdentity((await response.json()) as PortalIdentity);
      } catch {
        // The room itself will surface load errors; the shell stays.
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  if (status === "loading") return <SessionSpinner />;

  if (status === "unauthenticated") {
    return (
      <PortalGate
        next={pathname}
        onSignedIn={() => {
          void update();
        }}
      />
    );
  }

  const items = navItems();

  const isActive = (item: { key: string; href: string }) =>
    pathname === item.href || (item.key === "project" && pathname === "/workspace");

  const logOut = () => {
    void signOut({ redirect: false }).then(() => router.push("/"));
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <ConsoleFrame>
        <div className="-m-4 sm:-m-6 lg:m-0 lg:flex">
          {/* Desktop sidebar: persistent, quiet, structural. */}
          <aside className="hidden w-60 shrink-0 border-r border-border lg:flex lg:flex-col">
            <div className="border-b border-border px-4 py-5">
              <p className="truncate font-display text-sm font-bold">{identity?.organizationName ?? ""}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {COMMAND.shell.account.clientLabel} · {identity?.clientId ?? ""}
              </p>
            </div>
            <div className="min-h-0 flex-1">
              <nav aria-label={COMMAND.shell.navLabel} className="flex h-full flex-col gap-6 overflow-y-auto py-6">
                <ul role="list" className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item.key}>
                      <NavLink item={item} active={isActive(item)} />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="border-t border-border px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {COMMAND.shell.account.signedInAs}
              </p>
              <p className="mt-1 truncate text-sm font-medium">{identity?.name}</p>
              <p className="text-xs text-muted-foreground">
                {identity ? ROLE_LABELS[identity.role] : ""}
              </p>
              <button
                type="button"
                onClick={logOut}
                className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {COMMAND.shell.account.logOut}
              </button>
            </div>
          </aside>

          {/* Main column: utility bar + room content. */}
          <div className="min-w-0 flex-1 lg:pl-8">
            {/* Utility bar: mobile menu + wordmark only. */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-1 py-3">
              <div className="flex items-center gap-2 lg:hidden">
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-9" aria-label={COMMAND.shell.mobile.menu}>
                      <Menu className="size-4" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 border-border bg-background p-0">
                    <SheetHeader className="border-b border-border px-4 py-4 text-left">
                      <SheetTitle className="font-display text-sm font-bold">
                        {identity?.organizationName}
                      </SheetTitle>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.shell.account.clientLabel} · {identity?.clientId}
                      </p>
                    </SheetHeader>
                    <div className="flex h-[calc(100%-9rem)] flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <ul role="list" className="mt-2">
                          {items.map((item) => (
                            <li key={item.key}>
                              <NavLink item={item} active={isActive(item)} onSelect={() => setMenuOpen(false)} className="py-2.5" />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-border px-4 py-4">
                        <p className="truncate text-sm font-medium">{identity?.name}</p>
                        <p className="text-xs text-muted-foreground">{identity ? ROLE_LABELS[identity.role] : ""}</p>
                        <button
                          type="button"
                          onClick={logOut}
                          className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:underline"
                        >
                          {COMMAND.shell.account.logOut}
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <p className="truncate font-display text-sm font-bold lg:hidden">
                  {identity?.organizationName}
                </p>
              </div>
            </div>

            <div className="pb-20 pt-6 lg:pb-2">{children}</div>
          </div>
        </div>
      </ConsoleFrame>

      {/* Mobile bottom bar: the three rooms, nothing else. */}
      <nav
        aria-label={COMMAND.shell.navLabel}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul role="list" className="mx-auto grid max-w-lg grid-cols-3">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors",
                  isActive(item) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span aria-hidden="true" className={cn("h-0.5 w-5", isActive(item) ? "bg-primary" : "bg-transparent")} />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}
