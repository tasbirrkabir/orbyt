/**
 * One-off ops script (not part of the app runtime): provisions a real
 * (non-demo) tenant for verifying MFA and password-reset flows end to
 * end. Idempotent: safe to run repeatedly. The password reset E2E
 * changes this password; running the script again restores it.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const CLIENT_ID = "ORB-TST1";
const EMAIL = "resettest@orbyt.com";
const PASSWORD = "test-pass-123";

async function main() {
  const org = await db.organization.upsert({
    where: { clientId: CLIENT_ID },
    update: {},
    create: {
      name: "Test Roofer Co",
      clientId: CLIENT_ID,
      tier: "FULL_SERVICE",
      country: "BD",
    },
  });

  const existing = await db.user.findUnique({ where: { email: EMAIL } });
  const data = {
    email: EMAIL,
    name: "Reset Tester",
    passwordHash: hashPassword(PASSWORD),
    role: "CLIENT_OWNER",
    activatedAt: new Date(),
    organizationId: org.id,
    mfaSecret: null,
    mfaPendingSecret: null,
    mfaEnabledAt: null,
    tokenVersion: 0,
  };
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data });
  } else {
    await db.user.create({ data });
  }
  console.log("test tenant ready:", CLIENT_ID, EMAIL);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
