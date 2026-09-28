import { getServerSession } from "next-auth/next";
import { authOptions, type SessionUserWithId } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * The staff console boundary. Every /api/admin route starts here.
 * Only users with role ADMIN get through; client seats answer 401
 * so the shell flips them back to the gate.
 */

export type AdminContext = {
  userId: string;
  name: string;
  email: string;
};

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUserWithId | undefined;
  const userId =
    sessionUser && typeof sessionUser.id === "string" ? sessionUser.id : null;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, tokenVersion: true },
  });
  if (!user || user.role !== "ADMIN") return null;

  // Credential-change invalidation (see portal session.ts): the JWT's
  // tokenVersion must match the row, or the session is dead.
  if (sessionUser?.tv !== user.tokenVersion) return null;

  return {
    userId: user.id,
    name: user.name ?? "ORBYT Desk",
    email: user.email,
  };
}

/** Route-handler guard: the admin context or a clean 401. */
export async function requireAdmin(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) throw new AdminAuthError("Unauthorized", 401);
  return context;
}
