import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { nextClientId, recordStaffAudit } from "@/lib/admin/records";
import { hashPassword } from "@/lib/password";
import { TIERS } from "@/lib/portal/domain";
import type { AdminOrgItem, AdminOrgsPayload } from "@/lib/admin/types";

/**
 * GET  /api/admin/orgs (staff only)
 * POST /api/admin/orgs (staff only)
 *
 * GET lists every client organization with live counts for the roster.
 * POST creates an organization: issues the portal key ORB-XXXX and,
 * optionally, the owner seat in the same pass. A seat without a
 * password exists but cannot sign in until the desk sets one.
 * Contract:
 *   GET  200 AdminOrgsPayload
 *   POST 201 { org } | 400
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACTIVE_REQUEST_STATUSES = ["SUBMITTED", "REVIEWING", "IN_PROGRESS", "WAITING_FOR_CLIENT"];

const createSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    tier: z.enum(TIERS).default("WEBSITE_ONLY"),
    country: z.string().trim().toUpperCase().length(2),
    ownerName: z.string().trim().min(2).max(80).optional(),
    ownerEmail: z
      .string()
      .trim()
      .toLowerCase()
      .regex(EMAIL_PATTERN, "Email is not valid")
      .optional(),
    ownerPassword: z.string().min(8).max(72).optional(),
  })
  .refine((input) => Boolean(input.ownerEmail) === Boolean(input.ownerName), {
    message: "Owner name and owner email go together",
    path: ["ownerEmail"],
  })
  .refine((input) => !input.ownerPassword || Boolean(input.ownerEmail), {
    message: "An owner password needs an owner email",
    path: ["ownerPassword"],
  });

export async function GET() {
  return adminRoute(async () => {
    const [orgs, userCounts, projectCounts, approvalCounts, requestCounts] = await Promise.all([
      db.organization.findMany({ orderBy: { createdAt: "asc" } }),
      db.user.groupBy({ by: ["organizationId"], _count: { _all: true } }),
      db.project.groupBy({ by: ["organizationId"], _count: { _all: true } }),
      db.approval.groupBy({ by: ["organizationId"], where: { status: "PENDING" }, _count: { _all: true } }),
      db.request.groupBy({
        by: ["organizationId"],
        where: { status: { in: ACTIVE_REQUEST_STATUSES } },
        _count: { _all: true },
      }),
    ]);

    const countByOrg = (rows: { organizationId: string | null; _count: { _all: number } }[]) =>
      new Map(rows.map((row) => [row.organizationId, row._count._all]));
    const usersByOrg = countByOrg(userCounts);
    const projectsByOrg = countByOrg(projectCounts);
    const approvalsByOrg = countByOrg(approvalCounts);
    const requestsByOrg = countByOrg(requestCounts);

    const payload: AdminOrgsPayload = {
      orgs: orgs.map(
        (org): AdminOrgItem => ({
          id: org.id,
          name: org.name,
          clientId: org.clientId,
          tier: org.tier,
          country: org.country,
          userCount: usersByOrg.get(org.id) ?? 0,
          projectCount: projectsByOrg.get(org.id) ?? 0,
          openRequests: requestsByOrg.get(org.id) ?? 0,
          pendingApprovals: approvalsByOrg.get(org.id) ?? 0,
          createdAt: org.createdAt.toISOString(),
        }),
      ),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return adminRoute(async (context) => {
    const input = await readJson(request, createSchema);

    if (input.ownerEmail) {
      const existing = await db.user.findUnique({ where: { email: input.ownerEmail } });
      if (existing) {
        throw new z.ZodError([
          { code: "custom", path: ["ownerEmail"], message: "That email already has an account" },
        ]);
      }
    }

    const clientId = await nextClientId();
    const org = await db.organization.create({
      data: {
        name: input.name,
        clientId,
        tier: input.tier,
        country: input.country,
      },
    });

    if (input.ownerEmail && input.ownerName) {
      await db.user.create({
        data: {
          email: input.ownerEmail,
          name: input.ownerName,
          role: "CLIENT_OWNER",
          organizationId: org.id,
          clientId: org.clientId,
          passwordHash: input.ownerPassword ? hashPassword(input.ownerPassword) : null,
          activatedAt: input.ownerPassword ? new Date() : null,
        },
      });
    }

    await recordStaffAudit(context, {
      action: "org.create",
      organizationId: org.id,
      targetType: "ORG",
      targetLabel: `${org.name} (${org.clientId})`,
      metadata: { tier: org.tier, ownerSeatCreated: Boolean(input.ownerEmail) },
    });

    return NextResponse.json(
      {
        org: {
          id: org.id,
          name: org.name,
          clientId: org.clientId,
          tier: org.tier,
          country: org.country,
          createdAt: org.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  });
}
