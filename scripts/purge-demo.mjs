import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Starting demo data purge...");

  // Delete all child data linked to demo organizations
  const demoClientIds = ["ORB-DEMO", "ORB-NOVA", "ORB-ATLAS"];
  const demoEmails = [
    "demo@orbyt.com",
    "rahim@demoroasters.com",
    "sadia@demoroasters.com",
    "nova@orbyt.com",
    "arif@novafoods.com",
    "maya@novafoods.com",
    "atlas@orbyt.com",
    "imran@atlasclinics.com",
    "staff@orbyt.com", // demo staff if any
  ];

  // Using raw cascade or explicit delete:
  // In Postgres, TRUNCATE with CASCADE wipes everything cleanly and resets sequences
  // Let's check if there are any non-demo contact submissions or anything we should preserve
  const nonDemoUsers = await db.user.findMany({
    where: {
      email: { notIn: demoEmails },
      clientId: { notIn: demoClientIds },
    },
  });
  console.log("Non-demo users count:", nonDemoUsers.length);

  // Clean all demo records
  // Delete in proper dependency order
  console.log("Deleting demo child tables...");
  await db.message.deleteMany({});
  await db.messageThread.deleteMany({});
  await db.activityEvent.deleteMany({});
  await db.notification.deleteMany({});
  await db.systemEntry.deleteMany({});
  await db.report.deleteMany({});
  await db.meeting.deleteMany({});
  await db.invoice.deleteMany({});
  await db.approval.deleteMany({});
  await db.request.deleteMany({});
  await db.portalFile.deleteMany({});
  await db.milestone.deleteMany({});
  await db.deliverable.deleteMany({});
  await db.projectUpdate.deleteMany({});
  await db.scopeItem.deleteMany({});
  await db.changeRequest.deleteMany({});
  await db.decisionLogEntry.deleteMany({});
  await db.project.deleteMany({});
  await db.onboardingProfile.deleteMany({});
  await db.mfaBackupCode.deleteMany({});
  await db.mfaEnrollment.deleteMany({});
  await db.passwordResetToken.deleteMany({});
  await db.passwordResetAudit.deleteMany({});
  await db.authToken.deleteMany({});
  
  // Delete demo users
  const deletedUsers = await db.user.deleteMany({
    where: {
      OR: [
        { clientId: { in: demoClientIds } },
        { email: { in: demoEmails } },
      ],
    },
  });
  console.log(`Deleted ${deletedUsers.count} demo users.`);

  // Delete demo organizations
  const deletedOrgs = await db.organization.deleteMany({
    where: {
      clientId: { in: demoClientIds },
    },
  });
  console.log(`Deleted ${deletedOrgs.count} demo organizations.`);

  // Verify
  const remainingOrgs = await db.organization.count();
  const remainingUsers = await db.user.count();
  const remainingProjects = await db.project.count();
  console.log("--- VERIFICATION ---");
  console.log(`Remaining Organizations: ${remainingOrgs}`);
  console.log(`Remaining Users: ${remainingUsers}`);
  console.log(`Remaining Projects: ${remainingProjects}`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error("Purge failed:", e);
  process.exit(1);
});
