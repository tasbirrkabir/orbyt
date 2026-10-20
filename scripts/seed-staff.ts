import { PrismaClient } from "@prisma/client";
import { hashPassword } from "/home/z/my-project/src/lib/password";
import { randomUUID } from "node:crypto";

const db = new PrismaClient();

async function main() {
  const email = "staff@orbyt.com";
  const existing = await db.user.findUnique({ where: { email } });
  const data = {
    email,
    name: "ORBYT Desk",
    passwordHash: hashPassword("orbyt-admin"),
    role: "ADMIN",
  };
  if (existing) {
    await db.user.update({ where: { email }, data });
    console.log("staff updated");
  } else {
    const user = await db.user.create({ data: { id: `c${randomUUID().replaceAll("-", "").slice(0, 23)}`, ...data } });
    console.log("staff created:", user.id);
  }
  await db.$disconnect();
}
void main();
