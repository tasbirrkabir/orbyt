import { NextResponse } from "next/server";
import { portalRoute, routeId } from "@/lib/portal/api";
import { withdrawChangeRequestAsClient, ProjectOpsError } from "@/lib/project-ops";

/**
 * POST /api/portal/change-requests/[id]/withdraw (protected, write)
 *
 * The raising side takes its own PROPOSED change request back before
 * a decision. The withdrawal is recorded, never erased.
 *
 * Contract: 200 { ok } | 401 | 403 | 404 | 409 | 500.
 */

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const changeRequestId = await routeId(params);
    try {
      await withdrawChangeRequestAsClient(context, changeRequestId);
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof ProjectOpsError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  }, { write: true });
}
