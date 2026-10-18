import { db } from "@/lib/db";
import type {
  ActivityItem,
  AttentionItem,
  MilestoneItem,
  NextUpItem,
  ProjectSummary,
} from "./types";

/**
 * Shared server-side mappers: turn Prisma rows into the API payloads
 * the views consume. Progress is always computed from milestones,
 * never stored or hand-typed.
 */

export function progressFromMilestones(
  milestones: { status: string }[],
): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.status === "DONE").length;
  return Math.round((done / milestones.length) * 100);
}

export function mapProjectSummary(
  project: {
    id: string;
    code: string | null;
    title: string;
    stage: string;
    status: string;
    type: string;
    goal: string;
    ownerLabel: string;
    health?: string;
    healthNote?: string;
    healthUpdatedAt?: Date | null;
    startedAt: Date;
    targetLaunchAt: Date | null;
    milestones: { status: string; title: string; dueDate: Date | null }[];
    updates?: { createdAt: Date }[];
    approvals?: { status: string }[];
  },
): ProjectSummary {
  const activeMilestone = project.milestones.find((m) => m.status === "ACTIVE");
  const upcoming = project.milestones
    .filter((m) => m.status !== "DONE")
    .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const nextMilestone = activeMilestone?.title ?? upcoming[0]?.title ?? null;
  const lastUpdateAt = project.updates?.length
    ? project.updates.reduce<Date>(
        (latest, update) => (update.createdAt > latest ? update.createdAt : latest),
        project.updates[0].createdAt,
      )
    : null;
  const openApprovals = project.approvals?.filter((a) => a.status === "PENDING").length ?? 0;

  return {
    id: project.id,
    code: project.code,
    title: project.title,
    stage: project.stage,
    status: project.status,
    type: project.type,
    goal: project.goal,
    ownerLabel: project.ownerLabel,
    progress: progressFromMilestones(project.milestones),
    startedAt: project.startedAt.toISOString(),
    targetLaunchAt: project.targetLaunchAt?.toISOString() ?? null,
    nextMilestone,
    openApprovals,
    lastUpdateAt: lastUpdateAt?.toISOString() ?? null,
    health: project.health ?? "",
    healthNote: project.healthNote ?? "",
    healthUpdatedAt: project.healthUpdatedAt?.toISOString() ?? null,
  };
}

export function mapMilestone(milestone: {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
}): MilestoneItem {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    status: milestone.status,
    dueDate: milestone.dueDate?.toISOString() ?? null,
    completedAt: milestone.completedAt?.toISOString() ?? null,
  };
}

export function mapActivity(event: {
  id: string;
  type: string;
  title: string;
  actorName: string;
  actorRole: string;
  targetLabel: string;
  link: string | null;
  createdAt: Date;
}): ActivityItem {
  return {
    id: event.id,
    type: event.type,
    title: event.title,
    actorName: event.actorName,
    actorRole: event.actorRole,
    targetLabel: event.targetLabel,
    link: event.link,
    createdAt: event.createdAt.toISOString(),
  };
}

/**
 * The "Needs your attention" list, assembled server-side so the
 * priority order is policy, not chance: approvals first, then
 * requests waiting on the client, then invoices due.
 */
export function buildAttention(items: {
  approvals: { id: string; title: string; version: string; submittedAt: Date }[];
  requests: { id: string; code: string; title: string; updatedAt: Date }[];
  invoices: { id: string; number: string; totalCents: number; dueDate: Date }[];
  changeRequests?: {
    id: string;
    code: string;
    title: string;
    impactNote: string;
    projectId: string;
    createdAt: Date;
  }[];
  unreadThreads?: {
    id: string;
    subject: string;
    lastMessageAt: Date;
  }[];
}): AttentionItem[] {
  const attention: AttentionItem[] = [];

  for (const approval of items.approvals) {
    attention.push({
      id: `approval-${approval.id}`,
      kind: "APPROVAL",
      title: approval.title,
      detail: `Version ${approval.version} is waiting on your sign-off.`,
      status: "PENDING",
      date: approval.submittedAt.toISOString(),
      ctaLabel: "Review",
      href: "/workspace/approvals",
    });
  }
  for (const changeRequest of items.changeRequests ?? []) {
    attention.push({
      id: `cr-${changeRequest.id}`,
      kind: "CHANGE_REQUEST",
      title: `${changeRequest.code}: ${changeRequest.title}`,
      detail: changeRequest.impactNote || "The crew proposed this change. Your decision settles it.",
      status: "PROPOSED",
      date: changeRequest.createdAt.toISOString(),
      ctaLabel: "Decide",
      href: `/workspace/projects/${changeRequest.projectId}?tab=changes`,
    });
  }
  for (const thread of items.unreadThreads ?? []) {
    attention.push({
      id: `message-${thread.id}`,
      kind: "MESSAGE",
      title: thread.subject,
      detail: "The crew replied to this conversation. Open it to catch up.",
      status: "UNREAD",
      date: thread.lastMessageAt.toISOString(),
      ctaLabel: "Read",
      href: `/workspace/messages/${thread.id}`,
    });
  }
  for (const request of items.requests) {
    attention.push({
      id: `request-${request.id}`,
      kind: "REQUEST",
      title: `${request.code}: ${request.title}`,
      detail: "The desk is waiting on something from you.",
      status: "WAITING_FOR_CLIENT",
      date: request.updatedAt.toISOString(),
      ctaLabel: "Reply",
      href: `/workspace/requests/${request.id}`,
    });
  }
  for (const invoice of items.invoices) {
    attention.push({
      id: `invoice-${invoice.id}`,
      kind: "INVOICE",
      title: `Invoice ${invoice.number}`,
      detail: "Payment pending.",
      status: "PENDING",
      date: invoice.dueDate.toISOString(),
      ctaLabel: "View",
      href: "/workspace/invoices",
    });
  }
  return attention;
}

/**
 * The single most useful next thing: the nearest upcoming meeting,
 * else the active milestone due date. Null means the honest
 * "nothing scheduled".
 */
export function buildNextUp(items: {
  meetings: { id: string; title: string; startsAt: Date }[];
  milestones: { projectId: string; title: string; dueDate: Date | null }[];
}): NextUpItem | null {
  const meeting = items.meetings
    .slice()
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
  const milestone = items.milestones
    .filter((m) => m.dueDate)
    .sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0))[0];

  if (meeting && (!milestone || meeting.startsAt <= (milestone.dueDate ?? meeting.startsAt))) {
    return {
      title: meeting.title,
      detail: "Meeting",
      date: meeting.startsAt.toISOString(),
      kind: "MEETING",
      href: "/workspace/meetings",
    };
  }
  if (milestone?.dueDate) {
    return {
      title: milestone.title,
      detail: "Milestone",
      date: milestone.dueDate.toISOString(),
      kind: "MILESTONE",
      href: `/workspace/projects/${milestone.projectId}`,
    };
  }
  return null;
}

/** Org-scoped project fetch used by several routes. */
export function orgProjectsQuery(organizationId: string) {
  return db.project.findMany({
    where: { organizationId },
    orderBy: { startedAt: "desc" },
    include: {
      milestones: { orderBy: { position: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
      approvals: { where: { status: "PENDING" }, select: { id: true } },
    },
  });
}
