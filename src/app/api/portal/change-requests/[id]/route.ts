import { NextResponse } from "next/server";
import { z } from "zod";
import { portalRoute, readJson, routeId } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { decideChangeRequestAsClient, ProjectOpsError } from "@/lib/project-ops";

/**
 * POST /api/portal/change-requests/[id] (protected, write)
 *
 * The client's one-way decision on a change request ORBYT proposed.
 * Accepting puts it on record; declining needs a note saying why.
 * Either way the decision and its decision-log entry commit together
 * and the record never changes again.
 *
 * Contract: 200 { ok, code, status } | 400 | 401 | 403 | 404 | 409 | 429 | 500.
 */

const decideSchema = z.object({
  decision: z.enum(["ACCEPTED", "DECLINED"]),
  note: z.string().trim().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const limit = checkRateLimit("portal-cr-decide", clientIp(request), 20, 10 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const changeRequestId = await routeId(params);
    const input = await readJson(request, decideSchema);

    try {
      const result = await decideChangeRequestAsClient(context, changeRequestId, input);
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      if (error instanceof ProjectOpsError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  }, { write: true });
}
