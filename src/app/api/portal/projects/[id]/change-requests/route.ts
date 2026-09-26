import { NextResponse } from "next/server";
import { z } from "zod";
import { portalRoute, readJson, routeId } from "@/lib/portal/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { proposeChangeRequestAsClient, ProjectOpsError } from "@/lib/project-ops";

/**
 * POST /api/portal/projects/[id]/change-requests (protected, write)
 *
 * The client raises a formal change request on their own project:
 * what they want changed and why. ORBYT reviews and decides; the
 * decision lands in the project decision log.
 *
 * Contract: 201 { ok, id, code } | 400 | 401 | 403 | 404 | 429 | 500.
 */

const raiseSchema = z.object({
  title: z.string().trim().min(4, "Give the change a short title").max(160),
  description: z.string().trim().min(10, "Describe the change in a sentence or two").max(4000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const limit = checkRateLimit("portal-cr", clientIp(request), 10, 10 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const projectId = await routeId(params);
    const input = await readJson(request, raiseSchema);

    try {
      const cr = await proposeChangeRequestAsClient(context, projectId, input);
      return NextResponse.json({ ok: true, id: cr.id, code: cr.code }, { status: 201 });
    } catch (error) {
      if (error instanceof ProjectOpsError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  }, { write: true });
}
