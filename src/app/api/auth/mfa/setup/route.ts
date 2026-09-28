import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAnyAuthContext } from "@/lib/account-session";
import { beginMfaEnrollment } from "@/lib/mfa";
import { isRateLimited, requestIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/mfa/setup (session required: portal or staff)
 *
 * Begin TOTP enrollment: creates (or restarts) a PENDING enrollment
 * and returns the secret in two forms:
 *   - secret: base32, for manual entry
 *   - uri:    otpauth:// for QR codes
 * The secret travels only over HTTPS to the already-authenticated
 * caller; at rest it is AES-256-GCM encrypted.
 *
 * Contract: 200 { secret, uri } | 401 | 429 | 500.
 */

export async function POST(request: Request) {
  const context = await getAnyAuthContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isRateLimited("mfa", `${requestIp(request)}:${context.userId}`)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const enrollment = await beginMfaEnrollment(context.userId, context.email);

  await db.auditLog.create({
    data: {
      actorEmail: context.email,
      actorRole: context.role,
      action: "account.mfa_setup_started",
      targetType: "ACCOUNT",
      targetLabel: context.email,
      metadataJson: "{}",
    },
  });

  return NextResponse.json({ secret: enrollment.secret, uri: enrollment.uri });
}
