import { getServerSession } from "next-auth/next";
import { authOptions, type SessionUserWithId } from "@/lib/auth";
import { db } from "@/lib/db";
import { canWrite, type PortalRole } from "./domain";

/**
 * The tenant boundary of the whole Command Center.
 *
 * Every portal API route starts here. The context carries the
 * authenticated user, their organization (the tenant), their role, and
 * the derived write permission. Every query and mutation downstream
 * MUST scope by `context.organizationId`; IDs arriving from the browser
 * are never trusted on their own.
 */

export type PortalContext = {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  tier: string;
  role: PortalRole;
  /** False for CLIENT_VIEWER: read-only across the portal. */
  canWrite: boolean;
};

export class PortalAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Resolve the portal context for the current session, or null.
 *
 * Legacy bridge: accounts created before organizations existed carry a
 * clientId directly on the user row. On first portal request they get
 * an organization created and linked, so nothing user-visible breaks.
 */
export async function getPortalContext(): Promise<PortalContext | null> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUserWithId | undefined;
  const userId =
    sessionUser && typeof sessionUser.id === "string" ? sessionUser.id : null;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });
  if (!user) return null;

  // Session invalidation: the JWT stamps the token version it was
  // issued with. Any password change or MFA change bumps the user's
  // version, and every older JWT stops resolving here. This is what
  // makes "sign out everywhere" a fact, not a promise.
  const tokenTv =
    sessionUser && typeof sessionUser.tv === "number" ? sessionUser.tv : null;
  if (tokenTv !== null && tokenTv !== user.tokenVersion) {
    return null;
  }

  let organization = user.organization;

  // Bridge pre-org accounts: give them their own organization.
  if (!organization && user.clientId) {
    organization =
      (await db.organization.findUnique({ where: { clientId: user.clientId } })) ??
      (await db.organization.create({
        data: {
          name: "Client workspace",
          clientId: user.clientId,
          tier: "WEBSITE_ONLY",
        },
      }));
    await db.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });
  }

  if (!organization) return null;

  const role = (
    ["CLIENT_OWNER", "CLIENT_MEMBER", "CLIENT_VIEWER"].includes(user.role)
      ? user.role
      : "CLIENT_OWNER"
  ) as PortalRole;

  return {
    userId: user.id,
    name: user.name ?? "Client",
    email: user.email,
    organizationId: organization.id,
    organizationName: organization.name,
    clientId: organization.clientId,
    tier: organization.tier,
    role,
    canWrite: canWrite(role),
  };
}

/**
 * Route-handler guard: returns the context or throws a PortalAuthError
 * the route maps to a clean 401. API routes call this first, always.
 */
export async function requirePortal(): Promise<PortalContext> {
  const context = await getPortalContext();
  if (!context) throw new PortalAuthError("Unauthorized", 401);
  return context;
}

/** Guard for write endpoints: viewers get a clean 403. */
export async function requirePortalWriter(): Promise<PortalContext> {
  const context = await requirePortal();
  if (!context.canWrite) throw new PortalAuthError("Read-only seat", 403);
  return context;
}

/**
 * Verify that a row belongs to the authenticated organization.
 * Returns the row or null; callers decide the 404. Never log the
 * mismatch itself: a foreign ID is just "not found" to the client.
 */
export function ownedByOrg<T extends { organizationId?: string | null }>(
  row: T | null,
  context: PortalContext,
): row is T & { organizationId: string } {
  return Boolean(row && row.organizationId === context.organizationId);
}
