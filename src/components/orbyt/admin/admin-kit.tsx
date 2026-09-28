"use client";

import { useEffect, useState } from "react";
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
import type { AdminOrgItem } from "@/lib/admin/types";

/**
 * Shared form and layout atoms for the staff console. Same visual
 * language as the client command center: bordered blocks, mono meta,
 * ember reserved for what genuinely needs eyes.
 */

export function AdminPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-border bg-card/50 p-5 ${className ?? ""}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border bg-card/50 px-4 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ListLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
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
