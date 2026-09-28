import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { bumpTokenVersion, getAnyAuthContext } from "@/lib/account-session";
import { confirmMfaEnrollment } from "@/lib/mfa";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/mfa/verify (session required)
 *
 * Confirm a PENDING enrollment with its first authenticator code.
 * Success flips the enrollment ACTIVE, issues single-use backup
 * codes (returned ONCE, stored as hashes) and bumps tokenVersion so
 * every other session dies; the current caller receives the new
 * version and refreshes its own session via useSession().update().
 *
 * Contract: 200 { backupCodes, tokenVersion } | 400 (wrong code /
 * nothing pending) | 401 | 429.
 */

const schema = z.object({ code: z.string().trim().min(6).max(12) });

export async function POST(request: Request) {
  const context = await getAnyAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isRateLimited("mfa", `${requestIp(request)}:${context.userId}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Enter the 6-digit code from your app." }, { status: 400 });
  }

  const confirmed = await confirmMfaEnrollment(context.userId, input.code);
  if (!confirmed) {
    return NextResponse.json(
      { error: "That code didn't match. Check your app and try again." },
      { status: 400 },
    );
  }

  const tokenVersion = await bumpTokenVersion(context.userId);

  await db.auditLog.create({
    data: {
      actorEmail: context.email,
      actorRole: context.role,
      action: "account.mfa_enabled",
      targetType: "ACCOUNT",
      targetLabel: context.email,
      metadataJson: "{}",
    },
  });

  return NextResponse.json({ backupCodes: confirmed.backupCodes, tokenVersion });
}
