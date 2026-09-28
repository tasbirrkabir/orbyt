"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { STAFF, STAFF_NAV_ITEMS, type StaffNavItemKey } from "@/content/admin";
import { cn } from "@/lib/utils";
import { AdminLoginForm } from "./admin-login-form";

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {STAFF.shell.loading}
      </p>
    </div>
  );
}

function Gate() {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md"
    >
      <div className="border border-border bg-card/50 p-6 sm:p-8">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {STAFF.shell.gate.eyebrow}
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {STAFF.shell.gate.title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          {STAFF.shell.gate.sub}
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </motion.div>
  );
}

function NoAccess() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="border border-border bg-card/50 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {STAFF.shell.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          {STAFF.shell.noAccess.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {STAFF.shell.noAccess.body}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href="/workspace">{STAFF.shell.noAccess.portalCta}</Link>
          </Button>
          <button
            type="button"
            onClick={() => void signOut({ redirect: false })}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {STAFF.shell.noAccess.logOut}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  onSelect,
  className,
}: {
  item: { label: string; href: string };
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

function isActiveKey(key: StaffNavItemKey, pathname: string): boolean {
  const href = STAFF_NAV_ITEMS[key].href;
  if (key === "overview") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The staff console shell. Locked sessions render the gate in place;
 * a client seat renders the no-access panel; a staff seat renders the
 * desk: persistent sidebar (desktop), drawer + bottom bar (mobile).
 * Zero redirects anywhere.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [identity, setIdentity] = useState<{ name: string; email: string } | null>(null);
  const [identityState, setIdentityState] = useState<"loading" | "ok" | "denied">("loading");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/admin/identity");
        if (response.ok && active) {
          const payload = (await response.json()) as { identity: { name: string; email: string } };
          setIdentity(payload.identity);
          setIdentityState("ok");
        } else if (active) {
          setIdentityState("denied");
        }
      } catch {
        if (active) setIdentityState("denied");
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  if (status === "loading" || (status === "authenticated" && identityState === "loading")) {
    return <SessionSpinner />;
  }

  if (status === "unauthenticated") return <Gate />;
  if (identityState === "denied") return <NoAccess />;

  const logOut = () => {
    void signOut({ redirect: false }).then(() => router.push("/"));
  };

  const groups = STAFF.nav.groups;
  const allKeys = groups.flatMap((group) => group.items);
  const primaryKeys = STAFF.mobilePrimary;
  const moreKeys = allKeys.filter((key) => !primaryKeys.includes(key));

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="border border-border bg-card/30 lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border lg:flex lg:flex-col">
          <div className="border-b border-border px-4 py-5">
            <p className="font-display text-sm font-bold">ORBYT Desk</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {STAFF.shell.eyebrow}
            </p>
          </div>
          <nav aria-label={STAFF.shell.navLabel} className="flex-1 overflow-y-auto py-4">
            {groups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-4 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70">
                  {group.label}
                </p>
                <ul role="list">
                  {group.items.map((key) => (
                    <li key={key}>
                      <NavLink item={STAFF_NAV_ITEMS[key]} active={isActiveKey(key, pathname)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-border px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {STAFF.shell.signedInAs}
            </p>
            <p className="mt-1 truncate text-sm font-medium">{identity?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{identity?.email}</p>
            <button
              type="button"
              onClick={logOut}
              className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {STAFF.shell.signOut}
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          {/* Utility bar (mobile) */}
          <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-9" aria-label={STAFF.shell.menu}>
                    <Menu className="size-4" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-border bg-background p-0">
                  <SheetHeader className="border-b border-border px-4 py-4 text-left">
                    <SheetTitle className="font-display text-sm font-bold">ORBYT Desk</SheetTitle>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {STAFF.shell.eyebrow}
                    </p>
                  </SheetHeader>
                  <div className="flex h-[calc(100%-9rem)] flex-col">
                    <div className="flex-1 overflow-y-auto">
                      {groups.map((group) => (
                        <div key={group.label} className="mt-4 first:mt-2">
                          <p className="mb-1 px-4 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70">
                            {group.label}
                          </p>
                          <ul role="list">
                            {group.items.map((key) => (
                              <li key={key}>
                                <NavLink
                                  item={STAFF_NAV_ITEMS[key]}
                                  active={isActiveKey(key, pathname)}
                                  onSelect={() => setMenuOpen(false)}
                                  className="py-2.5"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border px-4 py-4">
                      <p className="truncate text-sm font-medium">{identity?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{identity?.email}</p>
                      <button
                        type="button"
                        onClick={logOut}
                        className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 hover:underline"
                      >
                        {STAFF.shell.signOut}
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <p className="truncate font-display text-sm font-bold">ORBYT Desk</p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {STAFF.shell.eyebrow}
            </p>
          </div>

          <div className="p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <nav
        aria-label={STAFF.shell.navLabel}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul role="list" className="mx-auto grid max-w-lg grid-cols-5">
          {primaryKeys.map((key) => {
            const active = isActiveKey(key, pathname);
            return (
              <li key={key}>
                <Link
                  href={STAFF_NAV_ITEMS[key].href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span aria-hidden="true" className={cn("h-0.5 w-5", active ? "bg-primary" : "bg-transparent")} />
                  <span className="max-w-full truncate px-1">{STAFF_NAV_ITEMS[key].label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex w-full flex-col items-center gap-1 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span aria-hidden="true" className="h-0.5 w-5 bg-transparent" />
                  <span>{STAFF.shell.more}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="border-border bg-background px-2 pb-8">
                <ul role="list" className="grid grid-cols-2 gap-0.5">
                  {moreKeys.map((key) => (
                    <li key={key}>
                      <NavLink
                        item={STAFF_NAV_ITEMS[key]}
                        active={isActiveKey(key, pathname)}
                        className="py-3"
                      />
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </motion.div>
  );
}
