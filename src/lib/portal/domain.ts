/**
 * ORBYT Client Command Center: domain vocabulary.
 *
 * Client-safe constants: the closed sets behind every status string in
 * the schema, the tier-to-module visibility rules, and formatting
 * helpers. No server imports here; both API routes and UI import this.
 * Zero em-dashes anywhere.
 */

// ── Tiers ────────────────────────────────────────────────────
// What the client buys drives what the portal shows. Nothing else.
export const TIERS = ["WEBSITE_ONLY", "MARKETING_WEBSITE", "FULL_SERVICE"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABELS: Record<string, string> = {
  WEBSITE_ONLY: "Website engagement",
  MARKETING_WEBSITE: "Website + marketing",
  FULL_SERVICE: "Full service",
};

// ── Modules ──────────────────────────────────────────────────
export const MODULES = [
  "overview",
  "projects",
  "requests",
  "approvals",
  "deliverables",
  "files",
  "messages",
  "meetings",
  "activity",
  "reports",
  "systems",
  "billing",
  "team",
  "support",
  "settings",
] as const;
export type PortalModule = (typeof MODULES)[number];

const BASE_MODULES: PortalModule[] = [
  "overview",
  "projects",
  "requests",
  "approvals",
  "deliverables",
  "files",
  "messages",
  "meetings",
  "activity",
  "billing",
  "team",
  "support",
  "settings",
];

/** The canonical IA: which modules a tier sees. The server enforces this. */
export function modulesForTier(tier: string): PortalModule[] {
  if (tier === "FULL_SERVICE") return [...BASE_MODULES, "reports", "systems"];
  if (tier === "MARKETING_WEBSITE") return [...BASE_MODULES, "reports"];
  return BASE_MODULES;
}

/** Client roles. Viewers read, but never write. */
export const ROLES = ["CLIENT_OWNER", "CLIENT_MEMBER", "CLIENT_VIEWER"] as const;
export type PortalRole = (typeof ROLES)[number];
export const ROLE_LABELS: Record<string, string> = {
  CLIENT_OWNER: "Owner",
  CLIENT_MEMBER: "Member",
  CLIENT_VIEWER: "Viewer",
};

/** Write actions (approve, file requests, reply) need a real seat. */
export function canWrite(role: string): boolean {
  return role === "CLIENT_OWNER" || role === "CLIENT_MEMBER";
}

// ── Closed sets (mirrors prisma/schema.prisma) ───────────────
export const PROJECT_STAGES = ["DISCOVER", "DESIGN", "BUILD", "CONNECT", "MEASURE", "IMPROVE"] as const;
export const PROJECT_STATUSES = [
  "PLANNING", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "COMPLETED", "PAUSED", "ARCHIVED",
] as const;
export const PROJECT_TYPES = ["WEBSITE", "MARKETING", "AUTOMATION", "AI", "FULL_SERVICE"] as const;
export const MILESTONE_STATUSES = ["DONE", "ACTIVE", "UPCOMING"] as const;
export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "CHANGES_REQUESTED"] as const;
export const REQUEST_STATUSES = [
  "SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "COMPLETED", "CLOSED",
] as const;
export const REQUEST_CATEGORIES = [
  "WEBSITE", "DESIGN", "MARKETING", "TRACKING", "AUTOMATION", "AI", "TECHNICAL", "OTHER",
] as const;
export const REQUEST_PRIORITIES = ["NORMAL", "IMPORTANT", "URGENT"] as const;
export const FILE_CATEGORIES = [
  "STRATEGY", "BRAND", "UX", "DESIGN", "DEVELOPMENT", "MARKETING", "AUTOMATION", "AI", "TRACKING", "REPORTS", "FINAL", "OTHER",
] as const;
export const FILE_STATUSES = ["DRAFT", "SHARED", "FINAL", "ARCHIVED"] as const;
export const SYSTEM_CATEGORIES = [
  "WEBSITE", "TRACKING", "ANALYTICS", "MARKETING", "AUTOMATION", "AI", "FORMS", "INTEGRATIONS", "CRM", "NOTIFICATIONS",
] as const;
export const SYSTEM_STATUSES = [
  "HEALTHY", "WARNING", "ISSUE", "OFFLINE", "NOT_CONNECTED", "MONITORING", "ACTIVE", "PAUSED",
] as const;
export const CHECK_STATUSES = ["HEALTHY", "WARNING", "ISSUE", "OFFLINE", "UNKNOWN"] as const;
export const INVOICE_STATUSES = ["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"] as const;
export const ACTIVITY_TYPES = [
  "PROJECT", "REQUEST", "APPROVAL", "DELIVERABLE", "FILE", "REPORT", "SYSTEM", "BILLING", "MEETING", "MESSAGE", "ACCOUNT",
] as const;

/** Human labels for statuses. Sentence case, no jargon. */
export const STATUS_LABELS: Record<string, string> = {
  // project
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
  // milestone
  DONE: "Done",
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  // approval
  PENDING: "Pending",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
  // request
  SUBMITTED: "Submitted",
  REVIEWING: "Reviewing",
  WAITING_FOR_CLIENT: "Waiting for you",
  // priority
  NORMAL: "Normal",
  IMPORTANT: "Important",
  URGENT: "Urgent",
  // files and deliverables
  DRAFT: "Draft",
  SHARED: "Shared",
  FINAL: "Final",
  DELIVERED: "Delivered",
  "IN PREP": "In prep",
  // systems
  HEALTHY: "Healthy",
  WARNING: "Warning",
  ISSUE: "Issue",
  OFFLINE: "Offline",
  NOT_CONNECTED: "Not connected",
  MONITORING: "Monitoring",
  // billing
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
  // project operations: scope, change requests, health
  INCLUSION: "Included",
  EXCLUSION: "Not included",
  PLANNED: "Planned",
  DROPPED: "Dropped",
  PROPOSED: "Needs decision",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  OFF_TRACK: "Off track",
  ON_HOLD: "On hold",
};

/** Request categories with the plain-language name the client picked. */
export const CATEGORY_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  DESIGN: "Design",
  MARKETING: "Marketing",
  TRACKING: "Tracking",
  AUTOMATION: "Automation",
  AI: "AI",
  TECHNICAL: "Technical",
  OTHER: "Other",
  STRATEGY: "Strategy",
  BRAND: "Brand",
  UX: "UX",
  DEVELOPMENT: "Development",
  REPORTS: "Reports",
  FINAL: "Final",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  MARKETING: "Marketing",
  AUTOMATION: "Automation",
  AI: "AI",
  FULL_SERVICE: "Full service",
};

// ── Formatting helpers (client-safe) ─────────────────────────
const DHAKA = "Asia/Dhaka";

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA,
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)}, ${new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)}`;
}

export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Compact age: "3m ago", "4h ago", "3d ago"; future dates read "in 6d". */
export function formatAge(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = date.getTime() - Date.now();
  const mins = Math.round(diffMs / 60000);
  if (mins < -1) {
    // Future: a due date, a meeting.
    const late = -mins;
    if (late < 60) return `in ${late}m`;
    const hours = Math.round(late / 60);
    if (hours < 24) return `in ${hours}h`;
    const days = Math.round(hours / 24);
    if (days < 14) return `in ${days}d`;
    return formatDateShort(date);
  }
  const past = Math.abs(mins);
  if (past < 1) return "just now";
  if (past < 60) return `${past}m ago`;
  const hours = Math.round(past / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks}w ago`;
  return formatDateShort(date);
}

/** Money in BDT from integer cents. No floating point anywhere. */
export function formatMoney(cents: number, currency = "BDT"): string {
  const units = cents / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: units % 1 === 0 ? 0 : 2,
  }).format(units);
  return currency === "BDT" ? `৳${formatted}` : `${currency} ${formatted}`;
}

/** Greeting bucket by Dhaka hour. */
export function greetingBucket(date = new Date()): "morning" | "afternoon" | "evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: DHAKA, hour: "2-digit", hour12: false }).format(date),
  );
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
