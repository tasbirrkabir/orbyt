"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Shared pieces for the staff console. Deliberately plain: this is a
 * working surface, not marketing. Every status label maps to a closed
 * set stored in the database; unknown values render as themselves so
 * nothing is ever silently rewritten.
 */

export const STAFF_KEY_STORE = "orbyt.staff.key";

export type StaffError = Error & { status?: number };

export async function staffFetch<T>(key: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (body as { error?: string }).error ?? `Request failed with status ${response.status}`;
    const error = new Error(message) as StaffError;
    error.status = response.status;
    throw error;
  }
  return body as T;
}

export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Not set";
  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

// ── Status badges (closed sets, mirrored from the service layer) ──

const LEAD_TONES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-900 border-amber-200",
  CONTACTED: "bg-stone-200 text-stone-800 border-stone-300",
  QUALIFIED: "bg-purple-100 text-purple-900 border-purple-200",
  CONVERTED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  ARCHIVED: "bg-stone-100 text-stone-500 border-stone-200",
};

const LEAD_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  ARCHIVED: "Archived",
};

export function LeadBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={LEAD_TONES[status] ?? "bg-stone-100 text-stone-700"}>
      {LEAD_LABELS[status] ?? status}
    </Badge>
  );
}

const HEALTH_TONES: Record<string, string> = {
  ON_TRACK: "bg-emerald-100 text-emerald-900 border-emerald-200",
  AT_RISK: "bg-amber-100 text-amber-900 border-amber-200",
  OFF_TRACK: "bg-red-100 text-red-900 border-red-200",
  ON_HOLD: "bg-stone-200 text-stone-700 border-stone-300",
};

const HEALTH_LABELS: Record<string, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  OFF_TRACK: "Off track",
  ON_HOLD: "On hold",
};

export function HealthBadge({ health }: { health: string }) {
  if (!health) {
    return (
      <Badge variant="outline" className="border-dashed bg-transparent text-stone-500">
        Not assessed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={HEALTH_TONES[health] ?? "bg-stone-100 text-stone-700"}>
      {HEALTH_LABELS[health] ?? health}
    </Badge>
  );
}

const CR_TONES: Record<string, string> = {
  PROPOSED: "bg-amber-100 text-amber-900 border-amber-200",
  ACCEPTED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  DECLINED: "bg-red-100 text-red-900 border-red-200",
  WITHDRAWN: "bg-stone-100 text-stone-500 border-stone-200",
};

export function ChangeRequestBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={CR_TONES[status] ?? "bg-stone-100 text-stone-700"}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

const WORK_TONES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 border-amber-200",
  SUBMITTED: "bg-amber-100 text-amber-900 border-amber-200",
  REVIEWING: "bg-purple-100 text-purple-900 border-purple-200",
  IN_PROGRESS: "bg-purple-100 text-purple-900 border-purple-200",
  WAITING_FOR_CLIENT: "bg-stone-200 text-stone-700 border-stone-300",
  COMPLETED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  CLOSED: "bg-stone-100 text-stone-500 border-stone-200",
  CHANGES_REQUESTED: "bg-red-100 text-red-900 border-red-200",
};

export function WorkBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={WORK_TONES[status] ?? "bg-stone-100 text-stone-700"}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const labels: Record<string, string> = {
    WEBSITE_ONLY: "Website only",
    MARKETING_WEBSITE: "Website + marketing",
    FULL_SERVICE: "Full service",
  };
  return <Badge variant="outline" className="bg-stone-100 text-stone-700">{labels[tier] ?? tier}</Badge>;
}

// ── Copy-to-clipboard chip ──────────────────────────────────────

export function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-300 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-700 transition-colors hover:bg-stone-100"
      title="Copy to clipboard"
    >
      <span className="truncate">{label ?? value}</span>
      {copied ? <Check className="h-3 w-3 shrink-0 text-emerald-700" /> : <Copy className="h-3 w-3 shrink-0 text-stone-500" />}
    </button>
  );
}

// ── Small building blocks ───────────────────────────────────────

export function ConsoleSection({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h3>
          {description ? <p className="mt-1 text-xs leading-relaxed text-stone-500">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "warn" | "danger" | "good";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "text-stone-900",
    warn: "text-amber-700",
    danger: "text-red-700",
    good: "text-emerald-700",
  };
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tabular-nums tracking-tight ${tones[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function InlineSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-stone-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
      {children}
    </p>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      Try again
    </Button>
  );
}
