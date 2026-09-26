import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import { nextCode, recordActivity, recordAudit, recordNotification } from "@/lib/portal/records";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/portal/checkin (protected, writers only)
 * Request a check-in call. Honest by construction: this files a
 * structured request on the desk with the preferred day, window and
 * agenda; a human confirms the actual slot by email. No calendar bot,
 * no fake booking confirmation.
 * Contract: 201 { requestId } | 400 | 401 | 403 | 429 | 500.
 */

const checkinSchema = z.object({
  day: z.enum(["Any day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  window: z.enum(["Morning", "Afternoon"]),
  agenda: z.string().trim().max(600).default(""),
});

// Shared limiter (src/lib/rate-limit.ts). One check-in every few minutes is plenty.

export async function POST(request: Request) {
  return portalRoute(
      async (context) => {
    if (!checkRateLimit("checkin", `${clientIp(request)}:${context.userId}`, 3, 30 * 60 * 1000).ok) {
      return NextResponse.json(
        { error: "A check-in request is already on the desk. Give it a bit." },
        { status: 429 },
      );
    }

    const input = await readJson(request, checkinSchema);

    const code = await nextCode(context.organizationId, "REQ");
    const created = await db.request.create({
      data: {
        organizationId: context.organizationId,
        code,
        requesterId: context.userId,
        requesterName: context.name,
        title: `Check-in request: ${input.day}, ${input.window.toLowerCase()}`,
        category: "OTHER",
        priority: "NORMAL",
        status: "SUBMITTED",
        description: input.agenda
          ? `The client requests a check-in call. Agenda: ${input.agenda}`
          : "The client requests a check-in call. No agenda given; confirm a slot by email.",
      },
    });

    await Promise.all([
      recordActivity(context, {
        type: "REQUEST",
        title: `Check-in requested (${input.day}, ${input.window.toLowerCase()})`,
        actorRole: "CLIENT",
        targetType: "REQUEST",
        targetLabel: created.code,
        link: `/workspace/requests/${created.id}`,
      }),
      recordAudit(context, {
        action: "checkin.request",
        targetType: "REQUEST",
        targetLabel: created.code,
        metadata: { day: input.day, window: input.window },
      }),
      recordNotification(context, {
        type: "REQUEST",
        title: `Check-in request received (${created.code})`,
        body: "A human confirms the slot by email, usually within one business day.",
        link: `/workspace/requests/${created.id}`,
      }),
    ]);

    return NextResponse.json({ requestId: created.id, code: created.code }, { status: 201 });
  }, { write: true });
}
