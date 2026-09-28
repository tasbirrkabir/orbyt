import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { bumpTokenVersion, getAnyAuthContext } from "@/lib/account-session";
import { verifyPassword } from "@/lib/password";
import { verifySecondFactor } from "@/lib/credentials";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/mfa/disable (session required)
 *
 * Turn MFA off. Requires the account password (and, when the caller
 * still holds an authenticator, a current code) so a hijacked tab
 * cannot strip the second factor. The enrollment is marked DISABLED
 * (kept for audit), backup hashes are cleared, and tokenVersion is
 * bumped: every other session dies immediately.
 *
 * Contract: 200 { tokenVersion } | 400 (wrong password / code) | 401 | 429.
 */

const schema = z.object({
  password: z.string().min(1).max(200),
  code: z.string().trim().max(12).optional(),
});

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
    return NextResponse.json({ error: "Enter your password to continue." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: context.userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
    return NextResponse.json({ error: "That password didn't match." }, { status: 400 });
  }

  // When an authenticator is still enrolled, require a live code too.
  const enrollment = await db.mfaEnrollment.findUnique({
    where: { userId: context.userId },
  });
  if (enrollment?.status === "ACTIVE") {
    if (!input.code) {
      return NextResponse.json({ error: "Enter a code from your app to finish." }, { status: 400 });
    }
    const factor = await verifySecondFactor(context.userId, input.code);
    if (!factor.ok) {
      return NextResponse.json({ error: "That code didn't match." }, { status: 400 });
    }
  }

  if (enrollment) {
    await db.mfaEnrollment.update({
      where: { userId: context.userId },
      data: { status: "DISABLED", backupHashesJson: "[]", lastUsedCode: "" },
    });
  }

  const tokenVersion = await bumpTokenVersion(context.userId);

  await db.auditLog.create({
    data: {
      actorEmail: context.email,
      actorRole: context.role,
      action: "account.mfa_disabled",
      targetType: "ACCOUNT",
      targetLabel: context.email,
      metadataJson: "{}",
    },
  });

  return NextResponse.json({ tokenVersion });
}
