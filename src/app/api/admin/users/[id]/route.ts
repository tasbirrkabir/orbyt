import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffAudit } from "@/lib/admin/records";
import { hashPassword } from "@/lib/password";
import { ROLES } from "@/lib/portal/domain";

/**
 * PATCH /api/admin/users/[id] (staff only)
 *
 * Edits a client seat: role, name, password (re)set. Staff accounts
 * are managed by the database, not this route; role ADMIN is rejected
 * here so a staff seat can never be downgraded or spoofed from the UI.
 * 200 { user } | 400 | 404
 */

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(ROLES).optional(),
  password: z.string().min(10).max(72).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.role === "ADMIN") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.role ? { role: input.role } : {}),
        // A staff-issued password invalidates every session the seat
        // holds (tokenVersion bump): old cookies stop resolving.
        ...(input.password
          ? {
              passwordHash: hashPassword(input.password),
              activatedAt: user.activatedAt ?? new Date(),
              tokenVersion: { increment: 1 },
            }
          : {}),
      },
    });

    await recordStaffAudit(context, {
      action: input.password ? "user.password_reset" : "user.update",
      organizationId: updated.organizationId ?? undefined,
      targetType: "USER",
      targetLabel: updated.email,
      metadata: { role: updated.role, nameChanged: Boolean(input.name && input.name !== user.name) },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        activated: Boolean(updated.activatedAt),
        createdAt: updated.createdAt.toISOString(),
      },
    });
  });
}
