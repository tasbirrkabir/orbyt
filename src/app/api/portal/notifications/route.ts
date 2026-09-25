import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { portalRoute, readJson } from "@/lib/portal/api";
import type { NotificationsPayload } from "@/lib/portal/types";

/**
 * GET  /api/portal/notifications (protected)
 * POST /api/portal/notifications (protected)
 *
 * GET lists the organization's notifications, unread first, newest
 * first. POST marks items read: { all: true } or { ids: string[] }.
 * Contract: GET 200 NotificationsPayload | POST 200 { ok: true }
 *           | 400 | 401 | 500.
 */

const readSchema = z
  .object({
    all: z.literal(true).optional(),
    ids: z.array(z.string().min(1).max(64)).max(100).optional(),
  })
  .refine((input) => input.all === true || (input.ids?.length ?? 0) > 0, {
    message: "Nothing to mark read",
  });

export async function GET() {
  return portalRoute(async (context) => {
    const notifications = await db.notification.findMany({
      where: { organizationId: context.organizationId },
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      take: 30,
    });

    const payload: NotificationsPayload = {
      unread: notifications.filter((notification) => notification.readAt === null).length,
      items: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        readAt: notification.readAt?.toISOString() ?? null,
        createdAt: notification.createdAt.toISOString(),
      })),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(request: Request) {
  return portalRoute(async (context) => {
    const input = await readJson(request, readSchema);
    const now = new Date();

    if (input.all) {
      await db.notification.updateMany({
        where: { organizationId: context.organizationId, readAt: null },
        data: { readAt: now },
      });
    } else if (input.ids) {
      // updateMany with org scoping: foreign ids are simply no-ops.
      await db.notification.updateMany({
        where: {
          organizationId: context.organizationId,
          id: { in: input.ids },
          readAt: null,
        },
        data: { readAt: now },
      });
    }

    return NextResponse.json({ ok: true });
  });
}
