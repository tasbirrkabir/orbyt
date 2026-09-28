import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { hashPassword } from "@/lib/password";
import { ROLES } from "@/lib/portal/domain";

/**
 * POST /api/admin/orgs/[id]/users (staff only)
 *
 * Creates a seat on the client organization. Email is unique across
 * the whole system. A seat without a password exists but cannot sign
 * in until the desk sets one.
 * 201 { user } | 400 | 404
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLIENT_ROLES = ROLES;

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().regex(EMAIL_PATTERN, "Email is not valid"),
  role: z.enum(CLIENT_ROLES).default("CLIENT_MEMBER"),
  password: z.string().min(8).max(72).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);
    const org = await db.organization.findUnique({ where: { id } });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new z.ZodError([
        { code: "custom", path: ["email"], message: "That email already has an account" },
      ]);
    }

    const user = await db.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        organizationId: org.id,
        clientId: org.clientId,
        passwordHash: input.password ? hashPassword(input.password) : null,
        activatedAt: input.password ? new Date() : null,
      },
    });

    await recordStaffAudit(context, {
      action: "user.create",
      organizationId: org.id,
      targetType: "USER",
      targetLabel: user.email,
      metadata: { role: user.role, activated: Boolean(user.activatedAt) },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          activated: Boolean(user.activatedAt),
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  });
}
