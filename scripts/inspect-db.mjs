import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("--- ORGANIZATIONS ---");
  const orgs = await db.organization.findMany({
    select: { id: true, clientId: true, name: true, tier: true, createdAt: true },
  });
  console.log(JSON.stringify(orgs, null, 2));

  console.log("--- USERS ---");
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, clientId: true, organizationId: true },
  });
  console.log(JSON.stringify(users, null, 2));

  console.log("--- COUNTS ---");
  console.log({
    projects: await db.project.count(),
    invoices: await db.invoice.count(),
    deliverables: await db.deliverable.count(),
    milestones: await db.milestone.count(),
    approvals: await db.approval.count(),
    requests: await db.request.count(),
    files: await db.portalFile.count(),
    threads: await db.messageThread.count(),
    events: await db.activityEvent.count(),
  });

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
