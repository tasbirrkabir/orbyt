import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portalRoute, routeId } from "@/lib/portal/api";
import { ownedByOrg } from "@/lib/portal/session";
import { getStorageProvider, verifyLocalDownloadToken } from "@/lib/storage";

/**
 * GET /api/portal/files/[id]/download (protected)
 *
 * The only path to file bytes. Authorization happens BEFORE any URL
 * is issued or any byte is read:
 *   1. the session must resolve to a portal seat,
 *   2. the file row must belong to the caller's organization,
 *   3. only then: local provider streams the bytes; R2 answers a
 *      short-lived presigned URL (60s). A foreign id is a plain 404,
 *      never an explanation.
 *
 * Files without storage bytes fall back to their link (email-era
 * index rows) when one exists. No bytes and no link: honest 404.
 *
 * `?t=` is accepted for time-limited grants issued inside the
 * session already; it never bypasses the org check.
 */

export async function GET(
  request: Request,
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
        mime: true,
        link: true,
        storageKey: true,
      },
    });

    if (!ownedByOrg(file, context)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Time-limited grant (same-session convenience downloads): the
    // token only ever narrows access, never widens it.
    const grant = new URL(request.url).searchParams.get("t");
    if (file.storageKey && grant && !verifyLocalDownloadToken(grant, file.storageKey)) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 });
    }

    if (file.storageKey) {
      const provider = getStorageProvider();
      if (provider.name === "r2") {
        const url = await provider.signedUrl(file.storageKey, 60);
        if (url) return NextResponse.redirect(url, 302);
      }
      try {
        const bytes = await provider.download(file.storageKey);
        return new NextResponse(new Uint8Array(bytes), {
          status: 200,
          headers: {
            "Content-Type": file.mime || "application/octet-stream",
            "Content-Length": String(bytes.length),
            "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
            "Cache-Control": "private, no-store",
          },
        });
      } catch (error) {
        console.error("[file-download] storage read failed:", error);
        return NextResponse.json({ error: "The file could not be read." }, { status: 500 });
      }
    }

    if (file.link) {
      return NextResponse.redirect(file.link, 302);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  });
}
