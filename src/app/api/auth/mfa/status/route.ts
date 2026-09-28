import { NextResponse } from "next/server";
import { getAnyAuthContext } from "@/lib/account-session";
import { db } from "@/lib/db";

/**
 * GET /api/auth/mfa/status (session required)
 *
 * The caller's MFA state for the settings panels: nothing here leaks
 * secrets, only the coarse status the UI needs.
 * Contract: 200 { active, pending } | 401.
 */

export async function GET() {
  const context = await getAnyAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollment = await db.mfaEnrollment.findUnique({
    where: { userId: context.userId },
    select: { status: true },
  });

  return NextResponse.json({
    active: enrollment?.status === "ACTIVE",
    pending: enrollment?.status === "PENDING",
  });
}
