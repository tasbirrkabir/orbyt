import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PortalAuthError } from "@/lib/portal/session";
import { AdminAuthError, requireAdmin, type AdminContext } from "./session";
import { readJson, routeId } from "@/lib/portal/api";

export { readJson, routeId };

/**
 * The one error funnel for every staff route. Handlers resolve an
 * AdminContext (401 if the session is not an ORBYT admin) and throw
 * AdminAuthError or ZodError; everything unexpected logs server-side
 * and answers a clean 500. Staff see plain words, never stack traces.
 */

export type AdminHandler = (context: AdminContext) => Promise<NextResponse>;

export async function adminRoute(handler: AdminHandler): Promise<NextResponse> {
  try {
    const context = await requireAdmin();
    return await handler(context);
  } catch (error) {
    if (error instanceof AdminAuthError || error instanceof PortalAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    console.error("[admin-api] Unhandled error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
