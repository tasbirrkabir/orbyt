import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials } from "@/lib/credentials";
import { createMfaLoginTicket } from "@/lib/mfa";
import { isRateLimited, requestIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/observability";

/**
 * POST /api/auth/mfa/challenge (public, hard rate limited)
 *
 * Step one of a two-step MFA login. Verifies email + password (+ the
 * client ID for portal seats) WITHOUT opening a session and answers:
 *   { mfaRequired: false }                    -> sign in normally
 *   { mfaRequired: true, ticket: "..." }      -> collect the code, then
 *      signIn("credentials", { ..., mfaTicket, mfaCode })
 *
 * The ticket is single use, expires in 5 minutes and is stored
 * hashed. Credentials failures and MFA-state failures are the same
 * generic 401: nothing about the account is revealed.
 */

const schema = z.object({
  clientId: z.string().max(40).optional(),
  email: z.string().trim().email().max(200).toLowerCase(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const ip = requestIp(request);

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Check the fields and try again." }, { status: 400 });
  }

  if (isRateLimited("login", `${ip}:${input.email}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const verified = await verifyCredentials(input);
  if (!verified) {
    return NextResponse.json({ error: "Those details don't match an account." }, { status: 401 });
  }

  if (!verified.mfaActive) {
    return NextResponse.json({ mfaRequired: false });
  }

  const ticket = await createMfaLoginTicket(verified.id);
  logEvent("auth", "mfa_challenge_issued", { userId: verified.id });
  return NextResponse.json({ mfaRequired: true, ticket });
}
