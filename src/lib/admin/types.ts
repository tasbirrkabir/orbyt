/**
 * Staff console payload contracts. Every /api/admin route returns one
 * of these shapes; every admin page consumes them. ISO strings for all
 * dates so the payloads stay JSON-clean.
 */

export type AdminIdentity = {
  name: string;
  email: string;
  role: "ADMIN";
};

export type AdminOverviewStats = {
  clients: number;
  activeProjects: number;
  pendingApprovals: number;
  openRequests: number;
  threadsAwaitingReply: number;
  outstandingCents: number;
  overdueInvoices: number;
  systemsAttention: number;
};

export type AdminAttentionItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  label: string;
  meta: string;
  link: string;
};

export type AdminOverviewPayload = {
  identity: AdminIdentity;
  stats: AdminOverviewStats;
  approvals: AdminAttentionItem[];
  requests: AdminAttentionItem[];
  threads: AdminAttentionItem[];
  audit: AdminAuditItem[];
};

export type AdminOrgItem = {
  id: string;
  name: string;
  clientId: string;
  tier: string;
  country: string;
  userCount: number;
  projectCount: number;
  openRequests: number;
  pendingApprovals: number;
  createdAt: string;
};

export type AdminOrgsPayload = {
  orgs: AdminOrgItem[];
};

export type AdminUserItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  activated: boolean;
  createdAt: string;
};

export type AdminProjectMini = {
  id: string;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  milestoneDone: number;
  milestoneTotal: number;
};

export type AdminOrgDetailPayload = {
  org: {
    id: string;
    name: string;
    clientId: string;
    tier: string;
    country: string;
    createdAt: string;
  };
  users: AdminUserItem[];
  projects: AdminProjectMini[];
  outstandingCents: number;
  openRequests: number;
  pendingApprovals: number;
};

export type AdminProjectItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  code: string | null;
  title: string;
  stage: string;
  status: string;
  type: string;
  goal: string;
  ownerLabel: string;
  targetLaunchAt: string | null;
  milestoneDone: number;
  milestoneTotal: number;
  updatedAt: string;
};

export type AdminProjectsPayload = {
  projects: AdminProjectItem[];
};

export type AdminMilestoneItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  position: number;
  dueDate: string | null;
  completedAt: string | null;
};

export type AdminUpdateItem = {
  id: string;
  tag: string;
  title: string;
  body: string;
  acknowledgedAt: string | null;
  createdAt: string;
};

export type AdminDeliverableItem = {
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
};

export type AdminProjectDetailPayload = {
  project: AdminProjectItem;
  milestones: AdminMilestoneItem[];
  updates: AdminUpdateItem[];
  deliverables: AdminDeliverableItem[];
};

export type AdminApprovalItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  projectId: string | null;
  projectTitle: string | null;
  deliverableId: string | null;
  deliverableTitle: string | null;
  title: string;
  type: string;
  version: string;
  description: string;
  status: string;
  submittedAt: string;
  decidedAt: string | null;
  decisionComment: string;
};

export type AdminApprovalsPayload = {
  approvals: AdminApprovalItem[];
};

export type AdminRequestComment = {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

export type AdminRequestItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  code: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  requesterName: string;
  projectId: string | null;
  projectTitle: string | null;
  comments: AdminRequestComment[];
  createdAt: string;
  updatedAt: string;
};

export type AdminRequestsPayload = {
  requests: AdminRequestItem[];
};

export type AdminThreadItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  projectId: string | null;
  projectTitle: string | null;
  subject: string;
  context: string;
  messageCount: number;
  lastSenderRole: string;
  lastMessageBody: string;
  unreadForClient: number;
  updatedAt: string;
};

export type AdminMessageItem = {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  readByClient: boolean;
  createdAt: string;
};

export type AdminThreadsPayload = {
  threads: AdminThreadItem[];
};

export type AdminThreadDetailPayload = {
  thread: AdminThreadItem;
  messages: AdminMessageItem[];
};

export type AdminFileItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  projectId: string | null;
  projectTitle: string | null;
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
};

export type AdminFilesPayload = {
  files: AdminFileItem[];
};

export type AdminMeetingItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  projectId: string | null;
  projectTitle: string | null;
  title: string;
  startsAt: string;
  durationMins: number;
  agenda: string;
  status: string;
  notes: string;
  decisions: string;
};

export type AdminMeetingsPayload = {
  meetings: AdminMeetingItem[];
};

export type AdminInvoiceItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
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

export type AdminInvoicesPayload = {
  invoices: AdminInvoiceItem[];
};

export type AdminSystemItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  name: string;
  category: string;
  status: string;
  description: string;
  trigger: string;
  actions: string;
  connected: string[];
  ownerLabel: string;
  lastCheckedAt: string | null;
  checkCount: number;
  runCount: number;
  lastRunStatus: string | null;
};

export type AdminSystemsPayload = {
  systems: AdminSystemItem[];
};

export type AdminReportMetric = {
  key: string;
  label: string;
  value: number;
  prev?: number;
  unit?: string;
  question?: string;
};

export type AdminReportSeries = {
  key: string;
  label: string;
  unit?: string;
  points: { label: string; value: number }[];
};

export type AdminReportItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  title: string;
  period: string;
  status: string;
  dataSource: string;
  metrics: AdminReportMetric[];
  series: AdminReportSeries[];
  note: string;
  updatedAt: string;
};

export type AdminReportsPayload = {
  reports: AdminReportItem[];
};

export type AdminAuditItem = {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetLabel: string;
  organizationName: string | null;
  createdAt: string;
};

export type AdminActivityPayload = {
  audit: AdminAuditItem[];
};
