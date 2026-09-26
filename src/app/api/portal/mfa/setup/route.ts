import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { portalRoute } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { generateTotpSecret, otpauthUri } from "@/lib/totp";
import { requireMfaManager } from "@/lib/portal/security";

/**
 * POST /api/portal/mfa/setup (protected, owner seat, demo blocked)
 *
 * Step one of enabling two-step verification: mint a fresh TOTP
 * secret, park it as the PENDING secret (MFA is still off), and hand
 * the client everything an authenticator app needs: the manual secret
 * and a QR code as a data URL. Nothing is enabled until verify
 * confirms a live code from the app.
 * Contract: 200 { secret, otpauth, qr } | 401 | 403 | 409 | 429 | 500.
 */

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    requireMfaManager(context);

    const limit = checkRateLimit(
      "mfa-setup",
      `${clientIp(request)}:${context.userId}`,
      5,
      10 * 60 * 1000,
    );
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: context.userId },
      select: { mfaEnabledAt: true },
    });
    if (user?.mfaEnabledAt) {
      return NextResponse.json(
        { error: "Two-step verification is already on." },
        { status: 409 },
      );
    }

    const secret = generateTotpSecret();
    await db.user.update({
      where: { id: context.userId },
      data: { mfaPendingSecret: secret },
    });

    const uri = otpauthUri(secret, context.email);
    const qr = await QRCode.toDataURL(uri, {
      margin: 1,
      width: 240,
      color: { dark: "#0E0E0D", light: "#FAF7F2" },
    });

    return NextResponse.json({ secret, otpauth: uri, qr });
  }, { write: true });
}
