/**
 * Shared API payload types for the Client Command Center.
 *
 * These are the contracts between /api/portal/* routes and the portal
 * views. Both sides import this file; a mismatch is a type error, not
 * a runtime surprise.
 */

import type { PortalModule } from "./domain";

// ── Identity / shell ─────────────────────────────────────────
export type PortalIdentity = {
  name: string;
  email: string;
  organizationName: string;
  clientId: string;
  tier: string;
  role: string;
  canWrite: boolean;
  modules: PortalModule[];
};

// ── Overview ─────────────────────────────────────────────────
export type MilestoneItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
};

export type ProjectSummary = {
  id: string;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  goal: string;
  ownerLabel: string;
  progress: number;
  startedAt: string;
  targetLaunchAt: string | null;
  nextMilestone: string | null;
  openApprovals: number;
  lastUpdateAt: string | null;
};

export type AttentionItem = {
  id: string;
  kind: "APPROVAL" | "REQUEST" | "INVOICE";
  title: string;
  detail: string;
  status: string;
  date: string;
  ctaLabel: string;
  href: string;
};

export type NextUpItem = {
  title: string;
  detail: string;
  date: string;
  kind: "MEETING" | "MILESTONE" | "DELIVERABLE";
  href: string | null;
};

export type PulseSystemItem = {
  id: string;
  name: string;
  category: string;
  status: string;
};

export type PulsePayload = {
  systems: PulseSystemItem[];
  healthyCount: number;
  totalCount: number;
  worstStatus: string | null;
};

export type ActivityItem = {
  id: string;
  type: string;
  title: string;
  actorName: string;
  actorRole: string;
  targetLabel: string;
  link: string | null;
  createdAt: string;
};

export type OverviewPayload = {
  identity: PortalIdentity;
  greetingName: string;
  activeProject: ProjectSummary | null;
  projectCount: number;
  attention: AttentionItem[];
  nextUp: NextUpItem | null;
  pulse: PulsePayload | null;
  recentActivity: ActivityItem[];
  upcomingMeetings: { id: string; title: string; startsAt: string; durationMins: number }[];
  billing: { pendingCount: number; pendingTotalCents: number; nextDueDate: string | null } | null;
  unreadNotifications: number;
};

// ── Projects ─────────────────────────────────────────────────
export type ProjectUpdateItem = {
  id: string;
  tag: string;
  title: string;
  body: string;
  acknowledgedAt: string | null;
  createdAt: string;
};

export type DeliverableItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  channel: string;
  approvalState: string;
  version: string;
  category: string;
  link: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type ProjectDetailPayload = {
  identity: PortalIdentity;
  project: ProjectSummary & { description: string };
  milestones: MilestoneItem[];
  deliverables: DeliverableItem[];
  updates: ProjectUpdateItem[];
  files: FileItem[];
  threadCount: number;
};

// ── Requests ─────────────────────────────────────────────────
export type RequestCommentItem = {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

export type RequestItem = {
  id: string;
  code: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  requesterName: string;
  projectId: string | null;
  projectTitle: string | null;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RequestDetailPayload = {
  identity: PortalIdentity;
  request: RequestItem;
  comments: RequestCommentItem[];
};

// ── Approvals ────────────────────────────────────────────────
export type ApprovalItem = {
  id: string;
  title: string;
  type: string;
  version: string;
  description: string;
  status: string;
  submittedAt: string;
  decidedAt: string | null;
  decisionComment: string;
  projectId: string | null;
  projectTitle: string | null;
  deliverableTitle: string | null;
};

export type ApprovalsPayload = {
  identity: PortalIdentity;
  pending: ApprovalItem[];
  decided: ApprovalItem[];
};

// ── Reports ──────────────────────────────────────────────────
export type ReportMetric = {
  key: string;
  label: string;
  value: number;
  prev: number;
  unit: string;
  question: string;
};

export type ReportSeries = {
  key: string;
  label: string;
  unit: string;
  points: { label: string; value: number }[];
};

export type ReportPayload = {
  identity: PortalIdentity;
  reports: {
    id: string;
    title: string;
    period: string;
    status: string;
    dataSource: string;
    note: string;
    updatedAt: string | null;
    metrics: ReportMetric[];
    series: ReportSeries[];
  }[];
};

// ── Systems ──────────────────────────────────────────────────
export type SystemItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  ownerLabel: string;
  lastCheckedAt: string | null;
  connectedCount: number;
};

export type SystemDetailPayload = {
  identity: PortalIdentity;
  system: SystemItem & {
    trigger: string;
    actions: string;
    connected: string[];
    lastUpdatedAt: string | null;
  };
  checks: { id: string; name: string; status: string; note: string; checkedAt: string }[];
  runs: { id: string; summary: string; status: string; ranAt: string }[];
};

// ── Files ────────────────────────────────────────────────────
export type FileItem = {
  id: string;
  name: string;
  kind: string;
  sizeKb: number;
  version: string;
  category: string;
  status: string;
  uploadedBy: string;
  note: string;
  link: string | null;
  uploadedAt: string;
  projectId: string | null;
  projectTitle: string | null;
};

export type FilesPayload = {
  identity: PortalIdentity;
  files: FileItem[];
};

// ── Messages ─────────────────────────────────────────────────
export type ThreadSummary = {
  id: string;
  subject: string;
  context: string;
  projectId: string | null;
  projectTitle: string | null;
  lastMessageAt: string;
  lastSenderRole: string;
  lastMessageBody: string;
  messageCount: number;
  unreadForClient: number;
};

export type ThreadDetailPayload = {
  identity: PortalIdentity;
  thread: Omit<ThreadSummary, "lastMessageAt" | "lastSenderRole" | "lastMessageBody" | "unreadForClient" | "messageCount">;
  messages: {
    id: string;
    senderName: string;
    senderRole: string;
    body: string;
    createdAt: string;
  }[];
};

// ── Meetings ─────────────────────────────────────────────────
export type MeetingItem = {
  id: string;
  title: string;
  startsAt: string;
  durationMins: number;
  agenda: string;
  status: string;
  notes: string;
  decisions: string;
  projectTitle: string | null;
};

export type MeetingsPayload = {
  identity: PortalIdentity;
  upcoming: MeetingItem[];
  past: MeetingItem[];
};

// ── Billing ──────────────────────────────────────────────────
export type InvoiceItem = {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  description: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  method: string;
};

export type BillingPayload = {
  identity: PortalIdentity;
  outstandingCents: number;
  paidThisYearCents: number;
  pending: InvoiceItem[];
  settled: InvoiceItem[];
};

// ── Team ─────────────────────────────────────────────────────
export type TeamPayload = {
  identity: PortalIdentity;
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    joinedAt: string | null;
  }[];
};

// ── Settings ─────────────────────────────────────────────────
export type NotificationPrefs = {
  approvals: boolean;
  requests: boolean;
  reports: boolean;
  billing: boolean;
  systems: boolean;
  meetings: boolean;
};

export type SettingsPayload = {
  identity: PortalIdentity;
  prefs: NotificationPrefs;
};

// ── Activity ─────────────────────────────────────────────────
export type ActivityPayload = {
  identity: PortalIdentity;
  events: ActivityItem[];
};

// ── Notifications ────────────────────────────────────────────
export type NotificationsPayload = {
  unread: number;
  items: {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    readAt: string | null;
    createdAt: string;
  }[];
};

// ── Search ───────────────────────────────────────────────────
export type SearchPayload = {
  groups: {
    label: string;
    items: { id: string; title: string; detail: string; href: string }[];
  }[];
};

// ── Deliverables (index) ─────────────────────────────────────
export type DeliverablesPayload = {
  identity: PortalIdentity;
  deliverables: (DeliverableItem & { projectId: string | null; projectTitle: string | null })[];
};
