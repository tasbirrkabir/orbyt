import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { hashPassword, verifyPassword } from "@/lib/password";
import { recordAudit } from "@/lib/portal/records";

/**
 * POST /api/portal/password (protected, writers only)
 * Change the caller's own password. Requires the current one; the
 * response is generic so nothing about the account is revealed.
 * Viewer accounts cannot change credentials for the workspace.
 * Contract: 200 { ok: true } | 400 | 401 | 403 | 500.
 */

const changeSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  return portalRoute(
      async (context) => {
    const input = await readJson(request, changeSchema);

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !verifyPassword(input.current, user.passwordHash)) {
      return NextResponse.json(
        { error: "That current password doesn't match." },
        { status: 400 },
      );
    }

    await db.user.update({
      where: { id: context.userId },
      data: { passwordHash: hashPassword(input.next) },
    });
    await recordAudit(context, {
      action: "account.password_change",
      targetType: "ACCOUNT",
      targetLabel: context.email,
    });

    return NextResponse.json({ ok: true });
  }, { write: true });
}
