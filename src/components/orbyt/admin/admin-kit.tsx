"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminOrgItem } from "@/lib/admin/types";

/**
 * Shared form and layout atoms for the staff console. The desk's own
 * visual language: rounded surfaces on the dark ground, one ember
 * accent for anything that needs eyes, icons before labels, and
 * numbers that always mean the same thing.
 */

export function AdminPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card/60 p-5 shadow-[0_1px_0_0_rgb(255_255_255_/_0.03)_inset] ${className ?? ""}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-4 transition-colors hover:border-primary/30">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Stat tone: what the number means, colored honestly. */
type StatTone = "neutral" | "ember" | "amber" | "emerald" | "rose";

const TONE_CHIP: Record<StatTone, string> = {
  neutral: "bg-muted/60 text-foreground",
  ember: "bg-primary/15 text-primary",
  amber: "bg-amber-500/15 text-amber-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  rose: "bg-rose-500/15 text-rose-500",
};

/**
 * StatCard: the metric tile with an icon chip. Numbers carry tone
 * only when the tone is a fact (overdue is rose, paid is emerald).
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
  href,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  href?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const body = (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      className={cn(
        "group h-full rounded-xl border border-border bg-card/60 p-4 transition-all duration-200",
        href ? "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card" : "hover:border-primary/25",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", TONE_CHIP[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {href ? (
          <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
        ) : null}
      </div>
      <p className="mt-3 font-display text-[1.65rem] font-bold leading-none tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</p> : null}
    </motion.div>
  );
  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}

/**
 * AttentionRow: one "needs you now" line in the overview band. A
 * count is always real; a zero row does not render at all.
 */
export function AttentionRow({
  icon: Icon,
  title,
  sub,
  count,
  href,
  tone = "ember",
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  count: number;
  href: string;
  tone?: Exclude<StatTone, "neutral">;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card/60 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
      >
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", TONE_CHIP[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{sub}</span>
        </span>
        <span className="shrink-0 font-display text-xl font-bold tabular-nums">{count}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

export function ListLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground", className)}>
      {children}
    </h2>
  );
}

/** Client picker. Fresh on every mount; the roster is small and this
 * keeps new organizations visible without a full reload. */
export function useOrgOptions() {
  const [orgs, setOrgs] = useState<AdminOrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/admin/orgs");
        if (!response.ok) return;
        const payload = (await response.json()) as { orgs: AdminOrgItem[] };
        if (active) setOrgs(payload.orgs);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { orgs, loading };
}

export function OrgSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (orgId: string) => void;
  id?: string;
}) {
  const { orgs } = useOrgOptions();
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full border-border bg-background">
        <SelectValue placeholder="Pick a client" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name} · {org.clientId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ProjectSelect({
  orgId,
  value,
  onChange,
  id,
}: {
  orgId: string;
  value: string;
  onChange: (projectId: string) => void;
  id?: string;
}) {
  const [projects, setProjects] = useState<{ id: string; title: string; code: string | null }[]>([]);
  useEffect(() => {
    if (!orgId) return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`/api/admin/projects?orgId=${encodeURIComponent(orgId)}`);
        if (!response.ok) return;
        const payload = (await response.json()) as { projects: { id: string; title: string; code: string | null }[] };
        if (active) setProjects(payload.projects);
      } catch {
        // The dialog stays usable; the field degrades to empty.
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // Derived at render so switching to "no client" empties the list
  // without state writes inside the effect body.
  const visible = orgId ? projects : [];

  if (!orgId) {
    return (
      <p className="text-xs text-muted-foreground">Pick a client first to list their projects.</p>
    );
  }

  return (
    <Select
      value={value || "none"}
      onValueChange={(next) => onChange(next === "none" ? "" : next)}
    >
      <SelectTrigger id={id} className="w-full border-border bg-background">
        <SelectValue placeholder="No specific project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No specific project</SelectItem>
        {visible.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.code ? `${project.code} · ` : ""}
            {project.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  min,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  min?: string;
  step?: string;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-border bg-background"
      />
    </Field>
  );
}

export function AreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-border bg-background"
      />
    </Field>
  );
}

export function ChoiceField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | { value: string; label: string }[];
}) {
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option.replaceAll("_", " ").toLowerCase() } : option,
  );
  return (
    <Field id={id} label={label}>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full border-border bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {normalized.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Date helpers: HTML inputs speak local, the API speaks ISO. */
export function dateToInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function datetimeToInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${dateToInput(value)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function inputToIso(value: string): string {
  return new Date(value).toISOString();
}
