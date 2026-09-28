import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson } from "@/lib/admin/api";
import { bumpTokenVersion } from "@/lib/account-session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { recordStaffAudit } from "@/lib/admin/records";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

/**
 * POST /api/admin/account/password (staff only, self service)
 *
 * Change the signed-in staff seat's own password. Requires the
 * current password; bumps tokenVersion so every other session this
 * seat holds stops resolving (the caller refreshes its own session
 * and signs back in).
 *
 * Contract: 200 { ok: true, tokenVersion } | 400 | 401 | 429.
 */

const schema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(10).max(200),
});

export async function POST(request: Request) {
  return adminRoute(async (admin) => {
    if (isRateLimited("adminMutation", `${requestIp(request)}:${admin.userId}`)) {
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    }

    const input = await readJson(request, schema);

    const user = await db.user.findUnique({
      where: { id: admin.userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !verifyPassword(input.current, user.passwordHash)) {
      return NextResponse.json({ error: "That current password doesn't match." }, { status: 400 });
    }

    const tokenVersion = await bumpTokenVersion(admin.userId);
    await db.user.update({
      where: { id: admin.userId },
      data: { passwordHash: hashPassword(input.next) },
    });

    await recordStaffAudit(admin, {
      action: "staff.password_change",
      targetType: "ACCOUNT",
      targetLabel: admin.email,
      metadata: { tokenVersion },
    });

    return NextResponse.json({ ok: true, tokenVersion });
  });
}
