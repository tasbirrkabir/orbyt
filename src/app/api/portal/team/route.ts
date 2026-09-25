import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { identityOf, portalRoute } from "@/lib/portal/api";
import type { TeamPayload } from "@/lib/portal/types";

/**
 * GET /api/portal/team (protected)
 * The organization's own workspace members and their roles. Only
 * ever the caller's organization. Contract: 200 TeamPayload | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    const members = await db.user.findMany({
      where: { organizationId: context.organizationId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    const payload: TeamPayload = {
      identity: identityOf(context),
      members: members.map((member) => ({
        id: member.id,
        name: member.name ?? member.email,
        email: member.email,
        role: member.role,
        active: Boolean(member.passwordHash),
        joinedAt: member.activatedAt?.toISOString() ?? null,
      })),
    };
    return NextResponse.json(payload);
  });
}
