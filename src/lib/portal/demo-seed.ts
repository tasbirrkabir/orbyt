import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { DEMO_ACCOUNTS, DEMO_AGE_DAYS, DEMO_PROFILE, DEMO_SUBMISSIONS } from "@/lib/demo";

/**
 * The Command Center seeder. Builds three complete demo tenants with
 * coherent, honest stories. Every block is idempotent: upserts keyed
 * by natural ids (clientId, email, code, number) or count-guards, so
 * re-running repairs and never duplicates.
 *
 * Honesty rules baked in: files travel by email (no fake download
 * links), report numbers are labeled sample data, invoices describe
 * real transfer methods, and no metric or health state is invented
 * beyond the sample story the demo openly is.
 */

const DAY = 86_400_000;
const HOUR = 3_600_000;
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * HOUR);
const ahead = (days: number, hours = 0) => new Date(Date.now() + days * DAY + hours * HOUR);

function parse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export async function seedCommandCenter(): Promise<void> {
  await seedDemoRoasters();
  await seedNovaFoods();
  await seedAtlasClinics();
}

// ── shared member list per org ───────────────────────────────
type MemberSeed = {
  name: string;
  email: string;
  role: "CLIENT_MEMBER" | "CLIENT_VIEWER";
  active: boolean;
};

async function ensureOrganization(account: (typeof DEMO_ACCOUNTS)[number]) {
  return db.organization.upsert({
    where: { clientId: account.clientId },
    update: { name: account.organizationName, tier: account.tier },
    create: {
      name: account.organizationName,
      clientId: account.clientId,
      tier: account.tier,
      country: "BD",
    },
  });
}

async function ensureOwner(
  account: (typeof DEMO_ACCOUNTS)[number],
  organizationId: string,
) {
  const owner = await db.user.upsert({
    where: { email: account.email },
    update: { organizationId, role: "CLIENT_OWNER", clientId: account.clientId },
    create: {
      email: account.email,
      name: account.name,
      passwordHash: hashPassword(account.password),
      clientId: account.clientId,
      organizationId,
      role: "CLIENT_OWNER",
      activatedAt: ago(DEMO_AGE_DAYS),
      // Created "a week ago" so the workspace shows a believable tenure.
      createdAt: ago(DEMO_AGE_DAYS),
    },
  });
  if (!owner.passwordHash) {
    await db.user.update({
      where: { id: owner.id },
      data: { passwordHash: hashPassword(account.password), activatedAt: new Date() },
    });
  }
  return owner;
}

async function ensureMembers(
  members: MemberSeed[],
  organizationId: string,
  clientId: string,
  password: string,
) {
  for (const member of members) {
    await db.user.upsert({
      where: { email: member.email },
      update: { organizationId },
      create: {
        email: member.email,
        name: member.name,
        organizationId,
        role: member.role,
        // Invited members get a working password; viewers stay pending.
        passwordHash: member.active ? hashPassword(password) : null,
        activatedAt: member.active ? ago(DEMO_AGE_DAYS) : null,
        // Pending members have no portal key of their own yet.
        clientId: null,
      },
    });
  }
  void clientId;
}

async function ensureActivity(
  organizationId: string,
  events: {
    type: string;
    title: string;
    actorName: string;
    actorRole: string;
    targetType?: string;
    targetLabel?: string;
    link?: string;
    createdAt: Date;
  }[],
) {
  const count = await db.activityEvent.count({ where: { organizationId } });
  if (count > 0) return;
  for (const event of events) {
    await db.activityEvent.create({
      data: {
        organizationId,
        type: event.type,
        title: event.title,
        actorName: event.actorName,
        actorRole: event.actorRole,
        targetType: event.targetType ?? "",
        targetLabel: event.targetLabel ?? "",
        link: event.link ?? null,
        createdAt: event.createdAt,
      },
    });
  }
}

async function ensureNotifications(
  organizationId: string,
  items: { type: string; title: string; body?: string; link?: string; read?: boolean; createdAt?: Date }[],
) {
  const count = await db.notification.count({ where: { organizationId } });
  if (count > 0) return;
  for (const item of items) {
    await db.notification.create({
      data: {
        organizationId,
        type: item.type,
        title: item.title,
        body: item.body ?? "",
        link: item.link ?? null,
        readAt: item.read ? (item.createdAt ?? new Date()) : null,
        createdAt: item.createdAt ?? new Date(),
      },
    });
  }
}

// ── project operations: scope, change requests, decisions, health ──
type ProjectOpsSeed = {
  scope: {
    title: string;
    detail?: string;
    kind: "INCLUSION" | "EXCLUSION";
    status?: string;
  }[];
  changeRequests: {
    code: string;
    title: string;
    description: string;
    impactNote?: string;
    raisedBy: "CLIENT" | "ORBYT";
    raisedByName: string;
    status: string;
    decidedAt?: Date | null;
    decidedByName?: string;
    decidedByRole?: string;
    decisionNote?: string;
    createdAt: Date;
  }[];
  decisions: {
    title: string;
    context?: string;
    decidedByRole: "CLIENT" | "ORBYT";
    decidedByName: string;
    sourceType?: string;
    sourceLabel?: string;
    decidedAt: Date;
  }[];
  health?: { health: string; note: string; at: Date };
};

/** Idempotent per project: each block only writes when its table is empty. */
async function ensureProjectOps(
  projectId: string,
  organizationId: string,
  seed: ProjectOpsSeed,
) {
  const scopeCount = await db.scopeItem.count({ where: { projectId } });
  if (scopeCount === 0) {
    for (const [index, item] of seed.scope.entries()) {
      await db.scopeItem.create({
        data: {
          projectId,
          title: item.title,
          detail: item.detail ?? "",
          kind: item.kind,
          status: item.status ?? "PLANNED",
          position: index,
          createdAt: ago(DEMO_AGE_DAYS),
        },
      });
    }
  }

  const crCount = await db.changeRequest.count({ where: { projectId } });
  if (crCount === 0) {
    for (const cr of seed.changeRequests) {
      await db.changeRequest.create({
        data: {
          organizationId,
          projectId,
          code: cr.code,
          title: cr.title,
          description: cr.description,
          impactNote: cr.impactNote ?? "",
          raisedBy: cr.raisedBy,
          raisedByName: cr.raisedByName,
          status: cr.status,
          decidedAt: cr.decidedAt ?? null,
          decidedByName: cr.decidedByName ?? "",
          decidedByRole: cr.decidedByRole ?? "",
          decisionNote: cr.decisionNote ?? "",
          createdAt: cr.createdAt,
        },
      });
    }
  }

  const decisionCount = await db.decisionLogEntry.count({ where: { projectId } });
  if (decisionCount === 0) {
    for (const entry of seed.decisions) {
      await db.decisionLogEntry.create({
        data: {
          organizationId,
          projectId,
          title: entry.title,
          context: entry.context ?? "",
          decidedByRole: entry.decidedByRole,
          decidedByName: entry.decidedByName,
          sourceType: entry.sourceType ?? "OTHER",
          sourceLabel: entry.sourceLabel ?? "",
          decidedAt: entry.decidedAt,
        },
      });
    }
  }

  if (seed.health) {
    await db.project.update({
      where: { id: projectId },
      data: {
        health: seed.health.health,
        healthNote: seed.health.note,
        healthUpdatedAt: seed.health.at,
      },
    });
  }
}

// ═════════════════════════════════════════════════════════════
// A. DEMO ROASTERS: website-only engagement
// The existing acquisition-system story, now with milestones,
// approvals, requests, files, threads, meetings and invoices.
// ═════════════════════════════════════════════════════════════
async function seedDemoRoasters() {
  const account = DEMO_ACCOUNTS[0];
  const org = await ensureOrganization(account);
  const owner = await ensureOwner(account, org.id);

  await ensureMembers(
    [
      { name: "Rahim Ahmed", email: "rahim@demoroasters.com", role: "CLIENT_MEMBER", active: true },
      { name: "Sadia Noor", email: "sadia@demoroasters.com", role: "CLIENT_VIEWER", active: false },
    ],
    org.id,
    account.clientId,
    account.password,
  );

  await db.onboardingProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      company: DEMO_PROFILE.company,
      industry: DEMO_PROFILE.industry,
      stage: DEMO_PROFILE.stage,
      challengesJson: JSON.stringify(DEMO_PROFILE.challenges),
      tools: DEMO_PROFILE.tools,
      goal: DEMO_PROFILE.goal,
      completedAt: ago(DEMO_AGE_DAYS - 1),
    },
  });

  const submissionCount = await db.contactSubmission.count({ where: { userId: owner.id } });
  if (submissionCount === 0) {
    for (const submission of DEMO_SUBMISSIONS) {
      await db.contactSubmission.create({
        data: {
          userId: owner.id,
          name: account.name,
          email: account.email,
          topic: submission.topic,
          message: submission.message,
          createdAt: ago(submission.daysAgo),
        },
      });
    }
  }

  // ── Project: the acquisition system ──
  const project =
    (await db.project.findFirst({
      where: { organizationId: org.id, title: "The acquisition system" },
    })) ??
    (await db.project.create({
      data: {
        userId: owner.id,
        organizationId: org.id,
        title: "The acquisition system",
        code: "PRJ-001",
        type: "WEBSITE",
        stage: "BUILD",
        status: "IN_PROGRESS",
        goal: "Every lead gets a reply within the hour, and the Monday report builds itself.",
        ownerLabel: "ORBYT crew",
        startedAt: ago(5),
        targetLaunchAt: ahead(16),
      },
    }));

  await ensureProjectOps(project.id, org.id, {
    scope: [
      { title: "Storefront rebuild", detail: "Five pages, mobile-first, on the brand system.", kind: "INCLUSION", status: "IN_PROGRESS" },
      { title: "Checkout and order flow", detail: "Shopify checkout, kept standard, tuned for speed.", kind: "INCLUSION", status: "IN_PROGRESS" },
      { title: "Local SEO groundwork", detail: "Meta, sitemap, speed pass, Google Business profile.", kind: "INCLUSION" },
      { title: "Handover session", detail: "One recorded walkthrough for the Roasters team.", kind: "INCLUSION" },
      { title: "Paid ad management", detail: "Quoted separately when the store is live.", kind: "EXCLUSION" },
      { title: "Product copywriting", detail: "The Roasters team writes; we review structure.", kind: "EXCLUSION" },
    ],
    changeRequests: [
      {
        code: "CR-0001",
        title: "Add a WhatsApp order button",
        description: "Most of our regulars order on WhatsApp anyway. Put the button where the checkout button is.",
        impactNote: "Half a day of build time. No date change.",
        raisedBy: "CLIENT",
        raisedByName: account.name,
        status: "ACCEPTED",
        decidedAt: ago(2),
        decidedByName: "ORBYT crew",
        decidedByRole: "ORBYT",
        decisionNote: "Fits the build. The button joins the checkout page scope.",
        createdAt: ago(3),
      },
      {
        code: "CR-0002",
        title: "Move launch by one week",
        description: "The Ramadan banner set deserves a proper pass. We want one more week before launch, with the store fully configured.",
        impactNote: "Launch moves one week later. Nothing else changes.",
        raisedBy: "ORBYT",
        raisedByName: "ORBYT crew",
        status: "PROPOSED",
        createdAt: ago(1),
      },
    ],
    decisions: [
      {
        title: "CR-0001 accepted",
        context: "Fits the build. The WhatsApp order button joins the checkout page scope.",
        decidedByRole: "ORBYT",
        decidedByName: "ORBYT crew",
        sourceType: "CHANGE_REQUEST",
        sourceLabel: "CR-0001",
        decidedAt: ago(2),
      },
      {
        title: "Checkout stays on Shopify",
        context: "A custom checkout was discussed and dropped: maintenance cost beats the benefit at this volume.",
        decidedByRole: "ORBYT",
        decidedByName: "ORBYT crew",
        sourceType: "MEETING",
        decidedAt: ago(4),
      },
    ],
    health: {
      health: "ON_TRACK",
      note: "Build is on plan. The one open question is the launch-week shift in CR-0002.",
      at: ago(1),
    },
  });

  const milestoneCount = await db.milestone.count({ where: { projectId: project.id } });
  if (milestoneCount === 0) {
    const milestones = [
      { title: "Discovery", description: "Where the leads actually come from, and where they die.", status: "DONE", due: ago(5), done: ago(5) },
      { title: "System map", description: "The click-to-repeat-purchase path, mapped and agreed.", status: "DONE", due: ago(4), done: ago(4) },
      { title: "Lead routing build", description: "One queue, one owner, a one hour timer.", status: "DONE", due: ago(1), done: ago(1) },
      { title: "GA4 instrumentation", description: "Full funnel from first view to purchase.", status: "DONE", due: ago(2), done: ago(2) },
      { title: "Conversions API", description: "Server-side purchase events into testing.", status: "ACTIVE", due: ahead(4), done: null },
      { title: "QA handover", description: "Pass or fail on every tracked event and form.", status: "UPCOMING", due: ahead(9), done: null },
      { title: "Launch support", description: "Two weeks of watch after go-live.", status: "UPCOMING", due: ahead(16), done: null },
    ];
    for (const [index, milestone] of milestones.entries()) {
      await db.milestone.create({
        data: {
          projectId: project.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          position: index,
          dueDate: milestone.due,
          completedAt: milestone.done,
        },
      });
    }
  }

  const updateCount = await db.projectUpdate.count({ where: { projectId: project.id } });
  if (updateCount === 0) {
    const updates = [
      {
        tag: "SHIPPED",
        title: "Lead routing is live",
        body: "Every form submission now lands in one queue with an owner and a one hour timer. The three inboxes and the spreadsheet are retired.",
        daysAgo: 1,
        ackDaysAgo: null as number | null,
      },
      {
        tag: "SHIPPED",
        title: "GA4 events rebuilt",
        body: "The full funnel is instrumented from first view to purchase. Ads and the store finally tell the same story.",
        daysAgo: 2,
        ackDaysAgo: 1,
      },
      {
        tag: "IN PROGRESS",
        title: "Conversions API wiring",
        body: "Server-side purchase events go into testing this week, so the ad platforms see every order even when cookies don't.",
        daysAgo: 3,
        ackDaysAgo: null,
      },
      {
        tag: "NOTE",
        title: "System map approved",
        body: "We mapped the path from ad click to repeat purchase and agreed where the first bottlenecks live: lead follow-up and weekly reporting.",
        daysAgo: 5,
        ackDaysAgo: null,
      },
    ];
    for (const update of updates) {
      await db.projectUpdate.create({
        data: {
          projectId: project.id,
          tag: update.tag,
          title: update.title,
          body: update.body,
          acknowledgedAt: update.ackDaysAgo === null ? null : ago(update.ackDaysAgo),
          createdAt: ago(update.daysAgo),
        },
      });
    }
  }

  // ── Deliverables ──
  const deliverableCount = await db.deliverable.count({ where: { project: { organizationId: org.id } } });
  if (deliverableCount === 0) {
    const deliverables = [
      {
        title: "Working agreement and scope",
        detail: "The engagement on one page: what we're building, the six stages, the cadence, and what we need from you and when.",
        status: "DELIVERED",
        approvalState: "FINAL",
        category: "STRATEGY",
        version: "v1",
        daysAgo: 5,
      },
      {
        title: "Lead routing blueprint",
        detail: "The routing map behind the new lead queue: owners, the one hour timer, and what happens when nobody picks up.",
        status: "DELIVERED",
        approvalState: "IN REVIEW",
        category: "AUTOMATION",
        version: "v2",
        daysAgo: 1,
      },
      {
        title: "GA4 event map",
        detail: "Every tracked event from first view to purchase, plus the test sheet we used to verify each one before sign-off.",
        status: "DELIVERED",
        approvalState: "APPROVED",
        category: "REPORTS",
        version: "v2",
        daysAgo: 2,
      },
      {
        title: "Conversions API test checklist",
        detail: "The pass or fail list the server-side events have to clear before they go live. Lands in your inbox when testing starts.",
        status: "IN PREP",
        approvalState: "DRAFT",
        category: "TRACKING",
        version: "v1",
        daysAgo: null as number | null,
      },
    ];
    for (const deliverable of deliverables) {
      await db.deliverable.create({
        data: {
          projectId: project.id,
          title: deliverable.title,
          detail: deliverable.detail,
          status: deliverable.status,
          channel: "EMAIL",
          approvalState: deliverable.approvalState,
          category: deliverable.category,
          version: deliverable.version,
          link: null,
          deliveredAt: deliverable.daysAgo === null ? null : ago(deliverable.daysAgo),
          createdAt: deliverable.daysAgo === null ? new Date() : ago(deliverable.daysAgo),
        },
      });
    }
  }

  // ── Approvals ──
  const approvalCount = await db.approval.count({ where: { organizationId: org.id } });
  if (approvalCount === 0) {
    await db.approval.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Lead routing blueprint",
        type: "DELIVERABLE",
        version: "v2",
        description: "Second pass on the routing map. Adds the after-hours path and the escalation owner. Yours to sign off.",
        status: "PENDING",
        submittedAt: ago(1),
      },
    });
    await db.approval.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "GA4 event map",
        type: "DOCUMENT",
        version: "v2",
        description: "Full funnel event map, verified against the test sheet.",
        status: "APPROVED",
        submittedAt: ago(2),
        decidedAt: ago(1, 4),
        decisionComment: "Matches what we agreed on the kickoff call. Good to go.",
        decidedById: owner.id,
      },
    });
  }

  // ── Requests ──
  const requestCount = await db.request.count({ where: { organizationId: org.id } });
  if (requestCount === 0) {
    const request1 = await db.request.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        code: "REQ-0001",
        requesterId: owner.id,
        requesterName: account.name,
        title: "Add a WhatsApp button to the contact page",
        category: "WEBSITE",
        priority: "NORMAL",
        status: "IN_PROGRESS",
        description: "Half our leads try to reach us on WhatsApp anyway. Can the contact page offer it next to the form?",
        createdAt: ago(3),
        updatedAt: ago(0, 5),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request1.id,
        authorName: "ORBYT crew",
        authorRole: "ORBYT",
        body: "Agreed it belongs there. We're placing it as a sticky button on mobile and inline beside the form on desktop. Draft lands this week.",
        createdAt: ago(2, 4),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request1.id,
        authorName: account.name,
        authorRole: "CLIENT",
        body: "Sticky on mobile sounds right. Please keep it away from the checkout steps.",
        createdAt: ago(2),
      },
    });

    const request2 = await db.request.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        code: "REQ-0002",
        requesterId: owner.id,
        requesterName: account.name,
        title: "Monday report lost the purchase column",
        category: "TRACKING",
        priority: "IMPORTANT",
        status: "COMPLETED",
        description: "The weekly sheet we agreed on is missing purchases since the GA4 rebuild. Can it come back?",
        createdAt: ago(6),
        updatedAt: ago(4),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request2.id,
        authorName: "ORBYT crew",
        authorRole: "ORBYT",
        body: "Fixed. Purchases were mapping to the old event name. The Monday report now reads from the new funnel events, so it won't drift again.",
        createdAt: ago(4),
      },
    });
  }

  // ── Files ──
  const fileCount = await db.portalFile.count({ where: { organizationId: org.id } });
  if (fileCount === 0) {
    const files = [
      { name: "working-agreement-scope.pdf", kind: "pdf", sizeKb: 412, version: "v1", category: "STRATEGY", status: "FINAL", uploadedBy: "ORBYT", note: "The engagement on one page.", daysAgo: 5 },
      { name: "lead-routing-blueprint-v2.pdf", kind: "pdf", sizeKb: 908, version: "v2", category: "AUTOMATION", status: "SHARED", uploadedBy: "ORBYT", note: "Waiting on your sign-off in Approvals.", daysAgo: 1 },
      { name: "ga4-event-map-v2.xlsx", kind: "xlsx", sizeKb: 268, version: "v2", category: "REPORTS", status: "FINAL", uploadedBy: "ORBYT", note: "Includes the test sheet tab.", daysAgo: 2 },
    ];
    for (const file of files) {
      await db.portalFile.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          name: file.name,
          kind: file.kind,
          sizeKb: file.sizeKb,
          version: file.version,
          category: file.category,
          status: file.status,
          uploadedBy: file.uploadedBy,
          note: file.note,
          link: null,
          uploadedAt: ago(file.daysAgo),
        },
      });
    }
  }

  // ── Threads ──
  const threadCount = await db.messageThread.count({ where: { organizationId: org.id } });
  if (threadCount === 0) {
    const thread1 = await db.messageThread.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        subject: "Conversions API: what testing covers",
        context: "PROJECT",
        createdAt: ago(2),
        updatedAt: ago(1),
      },
    });
    await db.message.create({
      data: {
        threadId: thread1.id,
        senderName: account.name,
        senderRole: "CLIENT",
        body: "Before the test checklist lands: does testing cover repeat purchases, or only first orders?",
        createdAt: ago(2, 3),
      },
    });
    await db.message.create({
      data: {
        threadId: thread1.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "Both. The event map covers first purchase and repeat, and the checklist tests them separately so one passing doesn't hide the other.",
        createdAt: ago(1, 6),
        readByClient: false,
      },
    });

    const thread2 = await db.messageThread.create({
      data: {
        organizationId: org.id,
        subject: "Friday notes",
        context: "GENERAL",
        createdAt: ago(5),
        updatedAt: ago(0, 2),
      },
    });
    await db.message.create({
      data: {
        threadId: thread2.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "Kickoff recap is in your email. Short version: lead follow-up first, weekly reporting second, everything else queues behind those two.",
        createdAt: ago(5),
      },
    });
    await db.message.create({
      data: {
        threadId: thread2.id,
        senderName: account.name,
        senderRole: "CLIENT",
        body: "Read it. One ask: when the queue pings, can it ping my phone and not just email?",
        createdAt: ago(4, 2),
      },
    });
    await db.message.create({
      data: {
        threadId: thread2.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "Yes. WhatsApp notification is part of the routing build. It's in the blueprint waiting on your approval.",
        createdAt: ago(4),
      },
    });

    // A thread the client spoke last: it shows up in the staff console
    // as needing a reply, closing the loop in both directions.
    const thread3 = await db.messageThread.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        subject: "Pixel fired twice on the thank-you page",
        context: "PROJECT",
        createdAt: ago(0, 9),
        updatedAt: ago(0, 3),
      },
    });
    await db.message.create({
      data: {
        threadId: thread3.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "We saw it too — dedupe is on the event map, so revenue is not double counted. Patch ships with today's deploy.",
        createdAt: ago(0, 7),
      },
    });
    await db.message.create({
      data: {
        threadId: thread3.id,
        senderName: account.name,
        senderRole: "CLIENT",
        body: "Good news. One more: can the weekly report include the dedupe numbers so finance stops asking? Happy to sign off on the template.",
        createdAt: ago(0, 3),
      },
    });
  }

  // ── Meetings ──
  const meetingCount = await db.meeting.count({ where: { organizationId: org.id } });
  if (meetingCount === 0) {
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Friday check-in",
        startsAt: ahead(1, 7),
        durationMins: 30,
        agenda: "Conversions API test results, WhatsApp button draft, anything blocking you.",
        status: "UPCOMING",
      },
    });
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Kickoff",
        startsAt: ago(5, 2),
        durationMins: 45,
        agenda: "The system map, priorities, and the working agreement.",
        status: "COMPLETED",
        notes: "Walked the click-to-purchase path. Agreed lead follow-up is the first bottleneck, weekly reporting the second.",
        decisions: "One queue for all leads. One hour reply timer. GA4 before ad work.",
      },
    });
  }

  // ── Invoices ──
  const invoiceCount = await db.invoice.count({ where: { organizationId: org.id } });
  if (invoiceCount === 0) {
    const invoice1 = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0001",
        issueDate: ago(5),
        dueDate: ago(-2),
        description: "Engagement start: discovery, system map, lead routing build.",
        subtotalCents: 12000000,
        taxCents: 0,
        totalCents: 12000000,
        status: "PAID",
        paidAt: ago(4),
        method: "BANK_TRANSFER",
      },
    });
    await db.payment.create({
      data: {
        invoiceId: invoice1.id,
        amountCents: 12000000,
        method: "BANK_TRANSFER",
        reference: "TRF-88412",
        paidAt: ago(4),
      },
    });
    await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0002",
        issueDate: ago(1),
        dueDate: ahead(6),
        description: "GA4 instrumentation and Conversions API wiring, milestone 3 and 4.",
        subtotalCents: 9000000,
        taxCents: 0,
        totalCents: 9000000,
        status: "PENDING",
      },
    });
  }

  // ── Activity + notifications ──
  await ensureActivity(org.id, [
    { type: "PROJECT", title: "Project started: The acquisition system", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "PROJECT", targetLabel: "The acquisition system", link: "/workspace/projects", createdAt: ago(5) },
    { type: "MEETING", title: "Kickoff completed, decisions on record", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "MEETING", targetLabel: "Kickoff", link: "/workspace/meetings", createdAt: ago(5, 2) },
    { type: "BILLING", title: "Invoice INV-0001 paid, thank you", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "INVOICE", targetLabel: "INV-0001", link: "/workspace/billing", createdAt: ago(4) },
    { type: "DELIVERABLE", title: "GA4 event map delivered by email", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "DELIVERABLE", targetLabel: "GA4 event map", link: "/workspace/deliverables", createdAt: ago(2) },
    { type: "APPROVAL", title: "GA4 event map v2 approved", actorName: account.name, actorRole: "CLIENT", targetType: "APPROVAL", targetLabel: "GA4 event map", link: "/workspace/approvals", createdAt: ago(1, 4) },
    { type: "REQUEST", title: "REQ-0001 moved to In progress", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "REQUEST", targetLabel: "REQ-0001", link: "/workspace/requests", createdAt: ago(2, 4) },
    { type: "DELIVERABLE", title: "Lead routing blueprint v2 delivered by email", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "DELIVERABLE", targetLabel: "Lead routing blueprint", link: "/workspace/deliverables", createdAt: ago(1) },
    { type: "APPROVAL", title: "Approval requested: Lead routing blueprint v2", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "APPROVAL", targetLabel: "Lead routing blueprint", link: "/workspace/approvals", createdAt: ago(1) },
  ]);

  await ensureNotifications(org.id, [
    { type: "APPROVAL", title: "Approval requested: Lead routing blueprint v2", body: "Second pass on the routing map is ready for your sign-off.", link: "/workspace/approvals", createdAt: ago(1) },
    { type: "BILLING", title: "Invoice INV-0002 is due in 6 days", body: "৳90,000. Bank transfer details are on the invoice.", link: "/workspace/billing", createdAt: ago(0, 8) },
    { type: "PROJECT", title: "Lead routing is live", body: "One queue, one owner, a one hour timer. Read the update and sign off.", link: "/workspace/projects", read: true, createdAt: ago(1) },
  ]);
}

// ═════════════════════════════════════════════════════════════
// B. NOVA FOODS: website + marketing. Adds Reports.
// ═════════════════════════════════════════════════════════════
async function seedNovaFoods() {
  const account = DEMO_ACCOUNTS[1];
  const org = await ensureOrganization(account);
  const owner = await ensureOwner(account, org.id);

  await ensureMembers(
    [
      { name: "Arif Chowdhury", email: "arif@novafoods.com", role: "CLIENT_MEMBER", active: true },
      { name: "Maya Islam", email: "maya@novafoods.com", role: "CLIENT_VIEWER", active: false },
    ],
    org.id,
    account.clientId,
    account.password,
  );

  // ── Project 1: storefront rebuild ──
  const storefront =
    (await db.project.findFirst({
      where: { organizationId: org.id, title: "Storefront rebuild" },
    })) ??
    (await db.project.create({
      data: {
        userId: owner.id,
        organizationId: org.id,
        title: "Storefront rebuild",
        code: "PRJ-001",
        type: "WEBSITE",
        stage: "BUILD",
        status: "IN_PROGRESS",
        goal: "A store that loads fast, tells the story in three scrolls, and stops leaking mobile carts.",
        ownerLabel: "ORBYT crew",
        startedAt: ago(24),
        targetLaunchAt: ahead(11),
      },
    }));

  await ensureProjectOps(storefront.id, org.id, {
    scope: [
      { title: "Store design and build", detail: "Home, collection, product, cart, story. Mobile-first.", kind: "INCLUSION", status: "IN_PROGRESS" },
      { title: "Product data migration", detail: "Top 100 SKUs migrated and spot-checked.", kind: "INCLUSION" },
      { title: "Analytics baseline", detail: "GA4 and conversion events before launch, so day one numbers are real.", kind: "INCLUSION" },
      { title: "Ongoing marketing management", detail: "Lives in the Q3 campaign sprint, not this build.", kind: "EXCLUSION" },
    ],
    changeRequests: [
      {
        code: "CR-0001",
        title: "Add a recipes page template",
        description: "A place for the chef's recipes doubles as organic search bait. One template, reused per recipe.",
        impactNote: "Adds three build days. Launch holds if decided this week.",
        raisedBy: "ORBYT",
        raisedByName: "ORBYT crew",
        status: "PROPOSED",
        createdAt: ago(1),
      },
    ],
    decisions: [
      {
        title: "Navigation reduced to four items",
        context: "Heatmaps showed menu paralysis on mobile. Fewer paths, clearer next step.",
        decidedByRole: "ORBYT",
        decidedByName: "ORBYT crew",
        sourceType: "MEETING",
        decidedAt: ago(6),
      },
    ],
    health: {
      health: "ON_TRACK",
      note: "Storefront on plan. Migration starts once the demo products are final.",
      at: ago(2),
    },
  });

  // ── Project 2: campaign sprint ──
  const campaign =
    (await db.project.findFirst({
      where: { organizationId: org.id, title: "Q3 campaign sprint" },
    })) ??
    (await db.project.create({
      data: {
        userId: owner.id,
        organizationId: org.id,
        title: "Q3 campaign sprint",
        code: "PRJ-002",
        type: "MARKETING",
        stage: "CONNECT",
        status: "IN_REVIEW",
        goal: "One creative set, one landing page, numbers clean enough to trust by August.",
        ownerLabel: "ORBYT crew",
        startedAt: ago(12),
        targetLaunchAt: ahead(5),
      },
    }));

  // ── Milestones ──
  const milestoneCount = await db.milestone.count({ where: { project: { organizationId: org.id } } });
  if (milestoneCount === 0) {
    const storefrontMilestones = [
      { title: "Discovery", description: "Cart funnel analytics and the five leak points.", status: "DONE", due: ago(24), done: ago(23) },
      { title: "UX and wireframes", description: "New path from landing to checkout in three scrolls.", status: "DONE", due: ago(17), done: ago(16) },
      { title: "Design system", description: "Type, color and product photography rules.", status: "DONE", due: ago(10), done: ago(9) },
      { title: "Build", description: "Storefront templates and checkout rebuild.", status: "ACTIVE", due: ahead(3), done: null },
      { title: "QA and content load", description: "Every template on every screen size, real products loaded.", status: "UPCOMING", due: ahead(8), done: null },
      { title: "Launch", description: "DNS cutover and launch-day watch.", status: "UPCOMING", due: ahead(11), done: null },
    ];
    for (const [index, milestone] of storefrontMilestones.entries()) {
      await db.milestone.create({
        data: {
          projectId: storefront.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          position: index,
          dueDate: milestone.due,
          completedAt: milestone.done,
        },
      });
    }
    const campaignMilestones = [
      { title: "Offer and audience", description: "Bundle offer, two audience tracks, budget split.", status: "DONE", due: ago(12), done: ago(11) },
      { title: "Creative set 01", description: "Static and video variants for the bundle.", status: "DONE", due: ago(7), done: ago(6) },
      { title: "Landing page", description: "Bundle page with the new checkout path.", status: "DONE", due: ago(3), done: ago(2) },
      { title: "Tracking sign-off", description: "Campaign events verified against the storefront map.", status: "ACTIVE", due: ahead(2), done: null },
    ];
    for (const [index, milestone] of campaignMilestones.entries()) {
      await db.milestone.create({
        data: {
          projectId: campaign.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          position: index,
          dueDate: milestone.due,
          completedAt: milestone.done,
        },
      });
    }
  }

  // ── Updates ──
  const updateCount = await db.projectUpdate.count({ where: { project: { organizationId: org.id } } });
  if (updateCount === 0) {
    await db.projectUpdate.create({
      data: {
        projectId: campaign.id,
        tag: "SHIPPED",
        title: "Campaign landing page is up on staging",
        body: "Bundle page loads in under two seconds on 4G, checkout hand-off verified. Creative set 02 review comes with it.",
        createdAt: ago(1),
      },
    });
    await db.projectUpdate.create({
      data: {
        projectId: storefront.id,
        tag: "IN PROGRESS",
        title: "Checkout rebuild, mobile first",
        body: "Address and delivery steps are merged. Cart abandonment testing starts once the sandbox products are in.",
        createdAt: ago(2),
      },
    });
    await db.projectUpdate.create({
      data: {
        projectId: storefront.id,
        tag: "SHIPPED",
        title: "Product template approved",
        body: "The product page template is signed off and locked. Gallery, reviews and bundle slots are in place.",
        acknowledgedAt: ago(4),
        createdAt: ago(5),
      },
    });
  }

  // ── Deliverables ──
  const deliverableCount = await db.deliverable.count({ where: { project: { organizationId: org.id } } });
  if (deliverableCount === 0) {
    await db.deliverable.create({
      data: {
        projectId: campaign.id,
        title: "Campaign creative set 02",
        detail: "Six statics and two cutdowns for the bundle push. Approved set locks the Q3 look.",
        status: "DELIVERED",
        channel: "EMAIL",
        approvalState: "IN REVIEW",
        category: "MARKETING",
        version: "v1",
        deliveredAt: ago(1),
        createdAt: ago(1),
      },
    });
    await db.deliverable.create({
      data: {
        projectId: campaign.id,
        title: "Landing page copy",
        detail: "Bundle page copy, second pass with your notes on the shipping line.",
        status: "DELIVERED",
        channel: "EMAIL",
        approvalState: "IN REVIEW",
        category: "MARKETING",
        version: "v2",
        deliveredAt: ago(2),
        createdAt: ago(2),
      },
    });
    await db.deliverable.create({
      data: {
        projectId: storefront.id,
        title: "Design system document",
        detail: "The storefront rules: type scale, color, spacing, and photo treatment.",
        status: "DELIVERED",
        channel: "EMAIL",
        approvalState: "APPROVED",
        category: "DESIGN",
        version: "v1",
        deliveredAt: ago(9),
        createdAt: ago(9),
      },
    });
  }

  // ── Approvals ──
  const approvalCount = await db.approval.count({ where: { organizationId: org.id } });
  if (approvalCount === 0) {
    await db.approval.create({
      data: {
        organizationId: org.id,
        projectId: campaign.id,
        title: "Campaign creative set 02",
        type: "CREATIVE",
        version: "v1",
        description: "Six statics and two video cutdowns. Approve to lock the Q3 look and start the spend plan.",
        status: "PENDING",
        submittedAt: ago(1),
      },
    });
    await db.approval.create({
      data: {
        organizationId: org.id,
        projectId: campaign.id,
        title: "Landing page copy",
        type: "COPY",
        version: "v2",
        description: "Second pass with your notes on the shipping line.",
        status: "CHANGES_REQUESTED",
        submittedAt: ago(2),
        decidedAt: ago(1, 6),
        decisionComment: "Shipping line still reads stiff. Keep the rest, rewrite that one sentence.",
        decidedById: owner.id,
      },
    });
  }

  // ── Requests ──
  const requestCount = await db.request.count({ where: { organizationId: org.id } });
  if (requestCount === 0) {
    const request1 = await db.request.create({
      data: {
        organizationId: org.id,
        projectId: campaign.id,
        code: "REQ-0001",
        requesterId: owner.id,
        requesterName: account.name,
        title: "Set up the Meta catalog feed",
        category: "MARKETING",
        priority: "IMPORTANT",
        status: "REVIEWING",
        description: "Retail team wants dynamic product ads running the same week the campaign starts. Feed needs to come from the new store.",
        createdAt: ago(4),
        updatedAt: ago(1, 3),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request1.id,
        authorName: "ORBYT crew",
        authorRole: "ORBYT",
        body: "On review. Feed comes free with the storefront build, so we'll wire it during QA week and test with ten products first.",
        createdAt: ago(1, 3),
      },
    });
    const request2 = await db.request.create({
      data: {
        organizationId: org.id,
        code: "REQ-0002",
        requesterId: owner.id,
        requesterName: account.name,
        title: "Wholesale price list page",
        category: "WEBSITE",
        priority: "NORMAL",
        status: "CLOSED",
        description: "One gated page with the trade price list, password from the sales team.",
        createdAt: ago(20),
        updatedAt: ago(15),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request2.id,
        authorName: "ORBYT crew",
        authorRole: "ORBYT",
        body: "Done and shipped on the old site. It moves over with the storefront rebuild, no extra work.",
        createdAt: ago(15),
      },
    });
  }

  // ── Files ──
  const fileCount = await db.portalFile.count({ where: { organizationId: org.id } });
  if (fileCount === 0) {
    await db.portalFile.create({ data: { organizationId: org.id, projectId: campaign.id, name: "creative-set-02.zip", kind: "zip", sizeKb: 18400, version: "v1", category: "MARKETING", status: "SHARED", uploadedBy: "ORBYT", note: "Waiting on sign-off in Approvals.", uploadedAt: ago(1) } });
    await db.portalFile.create({ data: { organizationId: org.id, projectId: storefront.id, name: "storefront-design-system.pdf", kind: "pdf", sizeKb: 2400, version: "v1", category: "DESIGN", status: "FINAL", uploadedBy: "ORBYT", note: "Approved design rules.", uploadedAt: ago(9) } });
    await db.portalFile.create({ data: { organizationId: org.id, projectId: storefront.id, name: "cart-funnel-audit.xlsx", kind: "xlsx", sizeKb: 388, version: "v1", category: "REPORTS", status: "FINAL", uploadedBy: "ORBYT", note: "The five leak points, with numbers.", uploadedAt: ago(23) } });
  }

  // ── Threads ──
  const threadCount = await db.messageThread.count({ where: { organizationId: org.id } });
  if (threadCount === 0) {
    const thread = await db.messageThread.create({
      data: {
        organizationId: org.id,
        projectId: campaign.id,
        subject: "Creative set 02: video cutdown lengths",
        context: "APPROVAL",
        createdAt: ago(1),
        updatedAt: ago(0, 4),
      },
    });
    await db.message.create({
      data: {
        threadId: thread.id,
        senderName: account.name,
        senderRole: "CLIENT",
        body: "Retail wants the 15s cutdown first on reels. Any reason the 6s is second?",
        createdAt: ago(1),
      },
    });
    await db.message.create({
      data: {
        threadId: thread.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "No reason it can't lead. We'll set 15s primary and 6s as the bumper when we schedule. Approve the set and we'll lock both.",
        createdAt: ago(0, 4),
        readByClient: false,
      },
    });
  }

  // ── Meetings ──
  const meetingCount = await db.meeting.count({ where: { organizationId: org.id } });
  if (meetingCount === 0) {
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: campaign.id,
        title: "Creative review with retail",
        startsAt: ahead(1, 5),
        durationMins: 45,
        agenda: "Walk the set 02 statics and cutdowns before sign-off.",
        status: "UPCOMING",
      },
    });
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: storefront.id,
        title: "Design handover review",
        startsAt: ago(9, 3),
        durationMins: 30,
        agenda: "Design system walkthrough.",
        status: "COMPLETED",
        notes: "Walked the type scale and photo rules. Retail team joins campaign reviews from now on.",
        decisions: "Design system approved as delivered.",
      },
    });
  }

  // ── Invoices ──
  const invoiceCount = await db.invoice.count({ where: { organizationId: org.id } });
  if (invoiceCount === 0) {
    const invoice1 = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0001",
        issueDate: ago(18),
        dueDate: ago(11),
        description: "Storefront rebuild, milestones 1 to 2: discovery and UX.",
        subtotalCents: 15000000,
        taxCents: 0,
        totalCents: 15000000,
        status: "PAID",
        paidAt: ago(12),
        method: "BANK_TRANSFER",
      },
    });
    await db.payment.create({ data: { invoiceId: invoice1.id, amountCents: 15000000, method: "BANK_TRANSFER", reference: "TRF-90233", paidAt: ago(12) } });
    await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0002",
        issueDate: ago(2),
        dueDate: ahead(9),
        description: "Campaign sprint setup and creative set 01, milestone 1 to 2.",
        subtotalCents: 7500000,
        taxCents: 0,
        totalCents: 7500000,
        status: "PENDING",
      },
    });
  }

  // ── Report: 30D sample + a not-connected source ──
  const reportCount = await db.report.count({ where: { organizationId: org.id } });
  if (reportCount === 0) {
    await db.report.create({
      data: {
        organizationId: org.id,
        title: "Campaign performance",
        period: "30D",
        status: "READY",
        dataSource: "Sample report, labeled demo data",
        note: "Sample data so you can see how reports read. Live numbers appear here once your ad account is connected by the crew.",
        metricsJson: JSON.stringify([
          { key: "SPEND", label: "Spend", value: 210000, prev: 180000, unit: "BDT", question: "How much did we put in?" },
          { key: "REVENUE", label: "Revenue", value: 689000, prev: 402000, unit: "BDT", question: "What came out?" },
          { key: "ROAS", label: "ROAS", value: 3.28, prev: 2.23, unit: "x", question: "For every taka, how many came back?" },
          { key: "CPA", label: "Cost per order", value: 341, prev: 467, unit: "BDT", question: "What does each order cost to win?" },
        ]),
        seriesJson: JSON.stringify([
          { key: "REVENUE", label: "Revenue", unit: "BDT", points: [
            { label: "W1", value: 89000 }, { label: "W2", value: 121000 }, { label: "W3", value: 178000 }, { label: "W4", value: 301000 },
          ] },
          { key: "SPEND", label: "Spend", unit: "BDT", points: [
            { label: "W1", value: 62000 }, { label: "W2", value: 55000 }, { label: "W3", value: 48000 }, { label: "W4", value: 45000 },
          ] },
        ]),
        updatedAt: ago(0, 6),
        createdAt: ago(7),
      },
    });
    await db.report.create({
      data: {
        organizationId: org.id,
        title: "Store analytics",
        period: "30D",
        status: "NOT_CONNECTED",
        dataSource: "",
        note: "Reports become available once reporting data is connected. The crew wires this during storefront QA week.",
        metricsJson: "[]",
        seriesJson: "[]",
        createdAt: ago(7),
      },
    });
  }

  // ── Activity + notifications ──
  await ensureActivity(org.id, [
    { type: "PROJECT", title: "Project started: Storefront rebuild", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "PROJECT", targetLabel: "Storefront rebuild", link: "/workspace/projects", createdAt: ago(24) },
    { type: "BILLING", title: "Invoice INV-0001 paid", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "INVOICE", targetLabel: "INV-0001", link: "/workspace/billing", createdAt: ago(12) },
    { type: "PROJECT", title: "Project started: Q3 campaign sprint", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "PROJECT", targetLabel: "Q3 campaign sprint", link: "/workspace/projects", createdAt: ago(12) },
    { type: "APPROVAL", title: "Landing page copy: changes requested", actorName: account.name, actorRole: "CLIENT", targetType: "APPROVAL", targetLabel: "Landing page copy", link: "/workspace/approvals", createdAt: ago(1, 6) },
    { type: "DELIVERABLE", title: "Campaign creative set 02 delivered by email", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "DELIVERABLE", targetLabel: "Campaign creative set 02", link: "/workspace/deliverables", createdAt: ago(1) },
    { type: "REPORT", title: "Campaign performance report updated", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "REPORT", targetLabel: "Campaign performance", link: "/workspace/reports", createdAt: ago(0, 6) },
  ]);

  await ensureNotifications(org.id, [
    { type: "APPROVAL", title: "Approval requested: Campaign creative set 02", body: "Six statics and two cutdowns. Approve to lock the Q3 look.", link: "/workspace/approvals", createdAt: ago(1) },
    { type: "BILLING", title: "Invoice INV-0002 is due in 9 days", body: "৳75,000. Bank transfer details are on the invoice.", link: "/workspace/billing", createdAt: ago(2) },
  ]);
}

// ═════════════════════════════════════════════════════════════
// C. ATLAS CLINICS: full service. Adds Systems (ORBYT Pulse).
// ═════════════════════════════════════════════════════════════
async function seedAtlasClinics() {
  const account = DEMO_ACCOUNTS[2];
  const org = await ensureOrganization(account);
  const owner = await ensureOwner(account, org.id);

  await ensureMembers(
    [
      { name: "Imran Sarker", email: "imran@atlasclinics.com", role: "CLIENT_MEMBER", active: true },
    ],
    org.id,
    account.clientId,
    account.password,
  );

  // ── Project ──
  const project =
    (await db.project.findFirst({
      where: { organizationId: org.id, title: "Patient intake automation" },
    })) ??
    (await db.project.create({
      data: {
        userId: owner.id,
        organizationId: org.id,
        title: "Patient intake automation",
        code: "PRJ-001",
        type: "AUTOMATION",
        stage: "BUILD",
        status: "IN_PROGRESS",
        goal: "From form fill to confirmed appointment without a receptionist touching a spreadsheet.",
        ownerLabel: "ORBYT crew",
        startedAt: ago(18),
        targetLaunchAt: ahead(9),
      },
    }));

  await ensureProjectOps(project.id, org.id, {
    scope: [
      { title: "Intake form and triage flow", detail: "From public form to the right department queue.", kind: "INCLUSION", status: "IN_PROGRESS" },
      { title: "WhatsApp reminder bot", detail: "Appointment reminders with a reply-to-confirm loop.", kind: "INCLUSION", status: "IN_PROGRESS" },
      { title: "Reception dashboard", detail: "Today's appointments, confirmations and gaps on one screen.", kind: "INCLUSION" },
      { title: "Telemedicine platform", detail: "Out of scope for this engagement.", kind: "EXCLUSION" },
    ],
    changeRequests: [
      {
        code: "CR-0001",
        title: "Add a Bangla-language intake form",
        description: "A large share of patients are more comfortable in Bangla. Same triage flow, second language layer.",
        impactNote: "Two extra build days and one review pass with the front desk.",
        raisedBy: "CLIENT",
        raisedByName: account.name,
        status: "PROPOSED",
        createdAt: ago(1),
      },
    ],
    decisions: [
      {
        title: "Reminders move to WhatsApp first",
        context: "Email open rates at the clinic were too low to trust for appointment reminders.",
        decidedByRole: "ORBYT",
        decidedByName: "ORBYT crew",
        sourceType: "MEETING",
        decidedAt: ago(5),
      },
    ],
    health: {
      health: "AT_RISK",
      note: "The WhatsApp template approval is pending with the provider. If it slips past Thursday, the launch date moves with it.",
      at: ago(1),
    },
  });

  const milestoneCount = await db.milestone.count({ where: { projectId: project.id } });
  if (milestoneCount === 0) {
    const milestones = [
      { title: "Discovery", description: "Shadowed two reception days, mapped every handoff.", status: "DONE", due: ago(18), done: ago(17) },
      { title: "Intake flow design", description: "Form, triage questions, booking rules.", status: "DONE", due: ago(12), done: ago(11) },
      { title: "Qualification agent build", description: "The AI pass that sorts urgent from routine.", status: "DONE", due: ago(5), done: ago(4) },
      { title: "Reminder system", description: "SMS and WhatsApp confirmations with reschedule link.", status: "ACTIVE", due: ahead(2), done: null },
      { title: "Staff training", description: "One session, one page of instructions, live practice.", status: "UPCOMING", due: ahead(6), done: null },
      { title: "Go-live", description: "Switch the old form off, watch for a week.", status: "UPCOMING", due: ahead(9), done: null },
    ];
    for (const [index, milestone] of milestones.entries()) {
      await db.milestone.create({
        data: {
          projectId: project.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          position: index,
          dueDate: milestone.due,
          completedAt: milestone.done,
        },
      });
    }
  }

  const updateCount = await db.projectUpdate.count({ where: { projectId: project.id } });
  if (updateCount === 0) {
    await db.projectUpdate.create({
      data: {
        projectId: project.id,
        tag: "SHIPPED",
        title: "Qualification agent is live",
        body: "Every intake submission now gets read, sorted urgent or routine, and routed. Reception sees only what needs a human.",
        createdAt: ago(4),
      },
    });
    await db.projectUpdate.create({
      data: {
        projectId: project.id,
        tag: "IN PROGRESS",
        title: "Reminder cadence tuning",
        body: "First reminder at booking, second 24 hours out, reschedule link on both. Testing tone with three patient scripts.",
        createdAt: ago(2),
      },
    });
  }

  // ── Systems ──
  const systemCount = await db.systemEntry.count({ where: { organizationId: org.id } });
  if (systemCount === 0) {
    const website = await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Clinic website",
        category: "WEBSITE",
        status: "HEALTHY",
        description: "The public site: services, doctors, and the intake form entry point.",
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(0, 1),
        lastUpdatedAt: ago(8),
      },
    });
    await db.systemCheck.create({ data: { systemId: website.id, name: "Uptime", status: "HEALTHY", note: "99.98% over 30 days.", checkedAt: ago(0, 1) } });
    await db.systemCheck.create({ data: { systemId: website.id, name: "SSL certificate", status: "HEALTHY", note: "Renews in 62 days.", checkedAt: ago(0, 1) } });

    const forms = await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Booking form pipeline",
        category: "FORMS",
        status: "HEALTHY",
        description: "Intake form on the website, validated and spam-filtered, feeding the automation.",
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(0, 2),
        lastUpdatedAt: ago(4),
      },
    });
    await db.systemCheck.create({ data: { systemId: forms.id, name: "Submission test", status: "HEALTHY", note: "Test submission reached the queue in 4 seconds.", checkedAt: ago(0, 2) } });

    const agent = await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Lead qualification agent",
        category: "AI",
        status: "ACTIVE",
        description: "Automatically reads every intake submission, sorts urgent from routine, and routes to the right desk before anyone replies.",
        trigger: "Every intake form submission",
        actions: "Reads the submission, classifies urgency, creates the record, notifies the right desk, starts the reply timer.",
        connectedJson: JSON.stringify(["Booking form pipeline", "Google Sheets roster", "WhatsApp notifications"]),
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(0, 1),
        lastUpdatedAt: ago(4),
      },
    });
    await db.systemCheck.create({ data: { systemId: agent.id, name: "Classification accuracy", status: "HEALTHY", note: "Spot-checked 20 records this week: 20 correct.", checkedAt: ago(1) } });
    await db.automationRun.create({ data: { systemId: agent.id, summary: "New intake received, classified urgent: chest pain history. Reception notified.", status: "OK", ranAt: ago(0, 2) } });
    await db.automationRun.create({ data: { systemId: agent.id, summary: "New intake received, classified routine: follow-up visit. Record created.", status: "OK", ranAt: ago(0, 3) } });
    await db.automationRun.create({ data: { systemId: agent.id, summary: "Classification timeout on one submission, retried and completed.", status: "FAILED", ranAt: ago(1, 5) } });
    await db.automationRun.create({ data: { systemId: agent.id, summary: "New intake received, classified routine: prescription refill. Record created.", status: "OK", ranAt: ago(1, 8) } });

    const tracking = await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Analytics and call tracking",
        category: "TRACKING",
        status: "HEALTHY",
        description: "Which pages and numbers actually drive bookings.",
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(1),
        lastUpdatedAt: ago(10),
      },
    });
    await db.systemCheck.create({ data: { systemId: tracking.id, name: "Event stream", status: "HEALTHY", note: "Booking events flowing from all three entry pages.", checkedAt: ago(1) } });

    await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Reminder notifications",
        category: "NOTIFICATIONS",
        status: "MONITORING",
        description: "SMS and WhatsApp confirmations with a reschedule link. In supervised rollout before go-live.",
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(1),
        lastUpdatedAt: ago(2),
      },
    });

    await db.systemEntry.create({
      data: {
        organizationId: org.id,
        name: "Meta campaigns",
        category: "MARKETING",
        status: "PAUSED",
        description: "Paused on purpose while the intake system settles. Relaunch decision after go-live week.",
        ownerLabel: "ORBYT",
        lastCheckedAt: ago(3),
        lastUpdatedAt: ago(3),
      },
    });
  }

  // ── Report ──
  const reportCount = await db.report.count({ where: { organizationId: org.id } });
  if (reportCount === 0) {
    await db.report.create({
      data: {
        organizationId: org.id,
        title: "Intake funnel",
        period: "30D",
        status: "READY",
        dataSource: "Sample report, labeled demo data",
        note: "Sample data so you can see how reports read. Live counts appear here after the intake system goes live.",
        metricsJson: JSON.stringify([
          { key: "INTAKES", label: "Intakes", value: 214, prev: 168, unit: "count", question: "How many patients started the process?" },
          { key: "QUALIFIED", label: "Qualified leads", value: 187, prev: 121, unit: "count", question: "How many were real, reachable bookings?" },
          { key: "REPLY_TIME", label: "Median reply time", value: 11, prev: 214, unit: "min", question: "How fast did the desk answer?" },
          { key: "BOOKED", label: "Bookings", value: 121, prev: 84, unit: "count", question: "How many became appointments?" },
        ]),
        seriesJson: JSON.stringify([
          { key: "BOOKED", label: "Bookings", unit: "count", points: [
            { label: "W1", value: 18 }, { label: "W2", value: 26 }, { label: "W3", value: 34 }, { label: "W4", value: 43 },
          ] },
          { key: "INTAKES", label: "Intakes", unit: "count", points: [
            { label: "W1", value: 38 }, { label: "W2", value: 51 }, { label: "W3", value: 58 }, { label: "W4", value: 67 },
          ] },
        ]),
        updatedAt: ago(0, 5),
        createdAt: ago(6),
      },
    });
  }

  // ── Deliverables ──
  const deliverableCount = await db.deliverable.count({ where: { project: { organizationId: org.id } } });
  if (deliverableCount === 0) {
    await db.deliverable.create({
      data: {
        projectId: project.id,
        title: "Intake flow diagram",
        detail: "Every step from form fill to confirmed booking, including the urgent path. Yours to approve.",
        status: "DELIVERED",
        channel: "EMAIL",
        approvalState: "IN REVIEW",
        category: "AUTOMATION",
        version: "v1",
        deliveredAt: ago(1),
        createdAt: ago(1),
      },
    });
    await db.deliverable.create({
      data: {
        projectId: project.id,
        title: "Agent rules document",
        detail: "What the qualification agent may and may not do, in plain language. The safety rules for patient-facing text.",
        status: "DELIVERED",
        channel: "EMAIL",
        approvalState: "APPROVED",
        category: "AI",
        version: "v1",
        deliveredAt: ago(4),
        createdAt: ago(4),
      },
    });
    await db.deliverable.create({
      data: {
        projectId: project.id,
        title: "Staff training one-pager",
        detail: "The one page reception needs. Lands before the training session.",
        status: "IN PREP",
        channel: "EMAIL",
        approvalState: "DRAFT",
        category: "OTHER",
        version: "v1",
        createdAt: ago(0, 3),
      },
    });
  }

  // ── Approvals ──
  const approvalCount = await db.approval.count({ where: { organizationId: org.id } });
  if (approvalCount === 0) {
    await db.approval.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Intake flow diagram",
        type: "DOCUMENT",
        version: "v1",
        description: "Every step from form fill to confirmed booking, urgent path included. Approve to lock the flow before reminder build finishes.",
        status: "PENDING",
        submittedAt: ago(1),
      },
    });
  }

  // ── Requests ──
  const requestCount = await db.request.count({ where: { organizationId: org.id } });
  if (requestCount === 0) {
    const request1 = await db.request.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        code: "REQ-0001",
        requesterId: owner.id,
        requesterName: account.name,
        title: "Agent text: add Bangla greetings",
        category: "AI",
        priority: "NORMAL",
        status: "WAITING_FOR_CLIENT",
        description: "The agent greets in English only right now. Half our patients type in Bangla first. Can it match language?",
        createdAt: ago(3),
        updatedAt: ago(1, 2),
      },
    });
    await db.requestComment.create({
      data: {
        requestId: request1.id,
        authorName: "ORBYT crew",
        authorRole: "ORBYT",
        body: "Yes, and it should match the patient's language, not guess from the browser. Draft rules are in the flow diagram. Confirm the greeting wording when you approve the diagram.",
        createdAt: ago(1, 2),
      },
    });
  }

  // ── Files ──
  const fileCount = await db.portalFile.count({ where: { organizationId: org.id } });
  if (fileCount === 0) {
    await db.portalFile.create({ data: { organizationId: org.id, projectId: project.id, name: "intake-flow-diagram-v1.pdf", kind: "pdf", sizeKb: 1240, version: "v1", category: "UX", status: "SHARED", uploadedBy: "ORBYT", note: "Waiting on sign-off in Approvals.", uploadedAt: ago(1) } });
    await db.portalFile.create({ data: { organizationId: org.id, projectId: project.id, name: "agent-rules-v1.pdf", kind: "pdf", sizeKb: 640, version: "v1", category: "BRAND", status: "FINAL", uploadedBy: "ORBYT", note: "The safety rules for patient-facing text.", uploadedAt: ago(4) } });
    await db.portalFile.create({ data: { organizationId: org.id, name: "reception-handover-notes.pdf", kind: "pdf", sizeKb: 220, version: "v1", category: "STRATEGY", status: "SHARED", uploadedBy: "ORBYT", note: "From the two shadow days.", uploadedAt: ago(16) } });
  }

  // ── Threads ──
  const threadCount = await db.messageThread.count({ where: { organizationId: org.id } });
  if (threadCount === 0) {
    const thread = await db.messageThread.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        subject: "Urgent case from Tuesday",
        context: "PROJECT",
        createdAt: ago(1),
        updatedAt: ago(0, 7),
      },
    });
    await db.message.create({
      data: {
        threadId: thread.id,
        senderName: account.name,
        senderRole: "CLIENT",
        body: "The chest pain intake on Tuesday was flagged in under a minute. That alone justifies the whole project. How did the timer do?",
        createdAt: ago(1),
      },
    });
    await db.message.create({
      data: {
        threadId: thread.id,
        senderName: "ORBYT crew",
        senderRole: "ORBYT",
        body: "Flagged in 38 seconds, reception called back in six minutes. The run history shows the full trace under Systems.",
        createdAt: ago(0, 7),
        readByClient: false,
      },
    });
  }

  // ── Meetings ──
  const meetingCount = await db.meeting.count({ where: { organizationId: org.id } });
  if (meetingCount === 0) {
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Reminder rollout review",
        startsAt: ahead(2, 6),
        durationMins: 30,
        agenda: "Pick the final reminder scripts, set the go-live date.",
        status: "UPCOMING",
      },
    });
    await db.meeting.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        title: "Agent rules walkthrough",
        startsAt: ago(4, 4),
        durationMins: 40,
        agenda: "The safety rules for patient-facing text.",
        status: "COMPLETED",
        notes: "Walked every rule with the clinical lead. Two wording changes made on the call.",
        decisions: "Agent never gives medical advice. Urgent cases always route to a human, no exceptions.",
      },
    });
  }

  // ── Invoices ──
  const invoiceCount = await db.invoice.count({ where: { organizationId: org.id } });
  if (invoiceCount === 0) {
    const invoice1 = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0001",
        issueDate: ago(14),
        dueDate: ago(7),
        description: "Intake automation, milestones 1 to 2: discovery and flow design.",
        subtotalCents: 18000000,
        taxCents: 0,
        totalCents: 18000000,
        status: "PAID",
        paidAt: ago(8),
        method: "BANK_TRANSFER",
      },
    });
    await db.payment.create({ data: { invoiceId: invoice1.id, amountCents: 18000000, method: "BANK_TRANSFER", reference: "TRF-77120", paidAt: ago(8) } });
    const invoice2 = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0002",
        issueDate: ago(6),
        dueDate: ahead(1),
        description: "Qualification agent build, milestone 3.",
        subtotalCents: 12000000,
        taxCents: 0,
        totalCents: 12000000,
        status: "PENDING",
      },
    });
    void invoice2;
    const invoice3 = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: "INV-0003",
        issueDate: ago(30),
        dueDate: ago(23),
        description: "Clinic website rebuild.",
        subtotalCents: 21000000,
        taxCents: 0,
        totalCents: 21000000,
        status: "PAID",
        paidAt: ago(24),
        method: "BKASH",
      },
    });
    await db.payment.create({ data: { invoiceId: invoice3.id, amountCents: 21000000, method: "BKASH", reference: "BKX-55821", paidAt: ago(24) } });
  }

  // ── Activity + notifications ──
  await ensureActivity(org.id, [
    { type: "PROJECT", title: "Project started: Patient intake automation", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "PROJECT", targetLabel: "Patient intake automation", link: "/workspace/projects", createdAt: ago(18) },
    { type: "SYSTEM", title: "Lead qualification agent went live", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "SYSTEM", targetLabel: "Lead qualification agent", link: "/workspace/systems", createdAt: ago(4) },
    { type: "MEETING", title: "Agent rules walkthrough completed, decisions on record", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "MEETING", targetLabel: "Agent rules walkthrough", link: "/workspace/meetings", createdAt: ago(4, 4) },
    { type: "SYSTEM", title: "Automation run retried after a timeout, completed", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "SYSTEM", targetLabel: "Lead qualification agent", link: "/workspace/systems", createdAt: ago(1, 5) },
    { type: "DELIVERABLE", title: "Intake flow diagram delivered by email", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "DELIVERABLE", targetLabel: "Intake flow diagram", link: "/workspace/deliverables", createdAt: ago(1) },
    { type: "APPROVAL", title: "Approval requested: Intake flow diagram v1", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "APPROVAL", targetLabel: "Intake flow diagram", link: "/workspace/approvals", createdAt: ago(1) },
    { type: "REPORT", title: "Intake funnel report updated", actorName: "ORBYT crew", actorRole: "ORBYT", targetType: "REPORT", targetLabel: "Intake funnel", link: "/workspace/reports", createdAt: ago(0, 5) },
  ]);

  await ensureNotifications(org.id, [
    { type: "APPROVAL", title: "Approval requested: Intake flow diagram v1", body: "Approve to lock the flow before the reminder build finishes.", link: "/workspace/approvals", createdAt: ago(1) },
    { type: "BILLING", title: "Invoice INV-0002 is due tomorrow", body: "৳120,000. Bank transfer details are on the invoice.", link: "/workspace/billing", createdAt: ago(0, 6) },
    { type: "SYSTEM", title: "Reminder notifications now in supervised rollout", body: "Three scripts testing with live bookings this week.", link: "/workspace/systems", read: true, createdAt: ago(2) },
  ]);
}

/** Small helper re-exported for the API route. */
export { parse as parseJsonSafe };
