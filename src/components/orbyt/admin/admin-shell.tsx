"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCheck,
  FolderKanban,
  FolderOpen,
  Gauge,
  History,
  Inbox,
  MessageCircle,
  ReceiptText,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  STAFF,
  STAFF_NAV_ICONS,
  STAFF_NAV_ITEMS,
  type StaffNavItemKey,
} from "@/content/admin";
import { cn } from "@/lib/utils";
import { AdminLoginForm } from "./admin-login-form";

/** Nav key -> icon component, resolved once. */
const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  users: Users,
  "folder-kanban": FolderKanban,
  inbox: Inbox,
  "check-check": CheckCheck,
  "message-circle": MessageCircle,
  "receipt-text": ReceiptText,
  activity: Activity,
  "folder-open": FolderOpen,
  calendar: Calendar,
  "bar-chart-3": BarChart3,
  history: History,
  "settings-2": Settings2,
};

function navIcon(key: StaffNavItemKey): LucideIcon {
  const name = STAFF_NAV_ICONS[key];
  return ICONS[name] ?? Gauge;
}

/** Live queue counts for the sidebar badges. Zero renders nothing. */
type DeskCounts = {
  openRequests: number;
  pendingApprovals: number;
  threadsAwaitingReply: number;
  overdueInvoices: number;
  systemsAttention: number;
};

function useDeskCounts(enabled: boolean): Partial<DeskCounts> {
  const [counts, setCounts] = useState<Partial<DeskCounts>>({});
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/admin/overview");
        if (!response.ok) return;
        const payload = (await response.json()) as { stats: DeskCounts };
        if (active) setCounts(payload.stats);
      } catch {
        // Badges are decoration; the rooms carry the real numbers.
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled]);
  return counts;
}

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
      <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-[0_20px_60px_-30px_rgb(0_0_0_/_0.8)] sm:p-8">
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
      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
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
  icon: Icon,
  active,
  count,
  onSelect,
  className,
}: {
  item: { label: string; href: string };
  icon: LucideIcon;
  active: boolean;
  count?: number;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all",
          active ? "bg-primary" : "bg-transparent",
        )}
      />
      <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none tabular-nums",
            active ? "bg-primary text-[#1B1B1A]" : "bg-primary/15 text-primary",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function isActiveKey(key: StaffNavItemKey, pathname: string): boolean {
  const href = STAFF_NAV_ITEMS[key].href;
  if (key === "overview") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/**
 * The staff console shell. Locked sessions render the gate in place;
 * a client seat renders the no-access panel; a staff seat renders the
 * desk: icon sidebar with live queue badges (desktop), drawer + icon
 * bottom bar (mobile). Zero redirects anywhere.
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

  const staffed = status === "authenticated" && identityState === "ok";
  const counts = useDeskCounts(staffed);

  const badgeFor = useMemo(
    () => (key: StaffNavItemKey): number | undefined => {
      const field = STAFF.nav.badges[key];
      if (!field) return undefined;
      const value = counts[field];
      return typeof value === "number" ? value : undefined;
    },
    [counts],
  );

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
      <div className="rounded-2xl border border-border bg-card/20 lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col rounded-l-2xl border-r border-border bg-card/40 lg:flex">
          <div className="flex items-center gap-3 border-b border-border px-4 py-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-sm font-black text-[#1B1B1A]">
              O
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold">ORBYT Desk</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {STAFF.shell.eyebrow}
              </p>
            </div>
          </div>
          <nav aria-label={STAFF.shell.navLabel} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="mb-1.5 px-3 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/60">
                  {group.label}
                </p>
                <ul role="list" className="space-y-0.5">
                  {group.items.map((key) => (
                    <li key={key}>
                      <NavLink
                        item={STAFF_NAV_ITEMS[key]}
                        icon={navIcon(key)}
                        active={isActiveKey(key, pathname)}
                        count={badgeFor(key)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
                {initials(identity?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{identity?.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{identity?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logOut}
              className="mt-3 w-full rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
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
                    <div className="flex-1 space-y-1 overflow-y-auto px-3">
                      {groups.map((group) => (
                        <div key={group.label} className="mt-4 first:mt-2">
                          <p className="mb-1.5 px-3 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/60">
                            {group.label}
                          </p>
                          <ul role="list" className="space-y-0.5">
                            {group.items.map((key) => (
                              <li key={key}>
                                <NavLink
                                  item={STAFF_NAV_ITEMS[key]}
                                  icon={navIcon(key)}
                                  active={isActiveKey(key, pathname)}
                                  count={badgeFor(key)}
                                  onSelect={() => setMenuOpen(false)}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
                          {initials(identity?.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold leading-tight">{identity?.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{identity?.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={logOut}
                        className="mt-3 w-full rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
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
            const Icon = navIcon(key);
            const count = badgeFor(key);
            return (
              <li key={key}>
                <Link
                  href={STAFF_NAV_ITEMS[key].href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2.5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute top-0 h-0.5 w-8 rounded-full", active ? "bg-primary" : "bg-transparent")} />
                  <span className="relative">
                    <Icon className="size-[18px]" aria-hidden="true" />
                    {typeof count === "number" && count > 0 ? (
                      <span aria-hidden="true" className="absolute -right-2 -top-1.5 flex min-w-[15px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[8px] font-bold leading-[14px] text-[#1B1B1A]">
                        {count > 9 ? "9+" : count}
                      </span>
                    ) : null}
                  </span>
                  <span className="max-w-full truncate px-1 font-mono text-[8px] uppercase tracking-[0.12em]">
                    {STAFF_NAV_ITEMS[key].label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="relative flex w-full flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-transparent" />
                  <Menu className="size-[18px]" aria-hidden="true" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em]">{STAFF.shell.more}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl border-border bg-background px-3 pb-8">
                <ul role="list" className="grid grid-cols-2 gap-1">
                  {moreKeys.map((key) => (
                    <li key={key}>
                      <NavLink
                        item={STAFF_NAV_ITEMS[key]}
                        icon={navIcon(key)}
                        active={isActiveKey(key, pathname)}
                        count={badgeFor(key)}
                        className="py-2.5"
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
