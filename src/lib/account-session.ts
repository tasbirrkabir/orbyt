import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions, type SessionUserWithId } from "@/lib/auth";

/**
 * Resolve ANY authenticated seat (portal client or ORBYT staff) for
 * the shared account-security endpoints (MFA setup/verify/disable).
 * Returns null for anonymous visitors. Enforces the same
 * tokenVersion rule as the portal and admin contexts so a session
 * that predates a credential change cannot manage MFA.
 */

export type AnyAuthContext = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "CLIENT";
};

export async function getAnyAuthContext(): Promise<AnyAuthContext | null> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUserWithId | undefined;
  const userId =
    sessionUser && typeof sessionUser.id === "string" ? sessionUser.id : null;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, tokenVersion: true },
  });
  if (!user) return null;
  if (sessionUser?.tv !== user.tokenVersion) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name ?? "ORBYT",
    role: user.role === "ADMIN" ? "ADMIN" : "CLIENT",
  };
}

/** Bump the user's tokenVersion; every prior session stops resolving. */
export async function bumpTokenVersion(userId: string): Promise<number> {
  const updated = await db.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
  return updated.tokenVersion;
}
