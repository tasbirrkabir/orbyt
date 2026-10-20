import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portalRoute, routeId } from "@/lib/portal/api";
import { ownedByOrg } from "@/lib/portal/session";

/**
 * GET /api/portal/files/[id]/download (protected)
 *
 * Authorization happens BEFORE any redirect is issued:
 *   1. the session must resolve to a portal seat,
 *   2. the file row must belong to the caller's organization,
 *   3. only then: the row's client-reachable link (email-era index,
 *      the way files actually travel) answers a 302.
 *
 * A foreign id is a plain 404, never an explanation. A row without a
 * link is an honest 404 too — no bytes are faked.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const id = await routeId(params);
    const file = await db.portalFile.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        name: true,
        link: true,
      },
    });

    if (!ownedByOrg(file, context)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!file.link) {
      return NextResponse.json(
        { error: "This file has no download link. Check the thread — files travel by email." },
        { status: 404 },
      );
    }

    return NextResponse.redirect(file.link, 302);
  });
}
