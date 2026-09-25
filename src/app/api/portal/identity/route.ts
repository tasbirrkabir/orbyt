import { NextResponse } from "next/server";
import { identityOf, portalRoute } from "@/lib/portal/api";

/**
 * GET /api/portal/identity (protected)
 * Who the session belongs to and which modules their tier includes.
 * The shell uses it for the nav; it carries no tenant data rows.
 * Contract: 200 PortalIdentity | 401 | 500.
 */
export async function GET() {
  return portalRoute(async (context) => {
    return NextResponse.json(identityOf(context));
  });
}
