import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import {
  PortalAuthError,
  requirePortal,
  requirePortalWriter,
  type PortalContext,
} from "./session";
import { modulesForTier } from "./domain";
import type { PortalIdentity } from "./types";

/** The identity block every payload carries. */
export function identityOf(context: PortalContext): PortalIdentity {
  return {
    name: context.name,
    email: context.email,
    organizationName: context.organizationName,
    clientId: context.clientId,
    tier: context.tier,
    role: context.role,
    canWrite: context.canWrite,
    modules: modulesForTier(context.tier),
  };
}

/**
 * The one error funnel for every portal route. Handlers resolve a
 * PortalContext (401 if none) and throw PortalAuthError or ZodError;
 * everything unexpected logs server-side and answers a clean 500.
 * Clients never see stack traces, driver errors or enum internals.
 */

export type PortalHandler = (context: PortalContext) => Promise<NextResponse>;

export async function portalRoute(
  handler: PortalHandler,
  options: { write?: boolean } = {},
): Promise<NextResponse> {
  try {
    const context = options.write
      ? await requirePortalWriter()
      : await requirePortal();
    return await handler(context);
  } catch (error) {
    if (error instanceof PortalAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    console.error("[portal-api] Unhandled error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** Parse a JSON body against a schema, or throw the funnel's errors. */
export async function readJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new PortalAuthError("Invalid JSON", 400);
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Resolve an id from a dynamic route segment. Next 16 wraps params in
 * a promise; this keeps every route body uniform.
 */
export async function routeId(
  params: Promise<{ id: string }>,
): Promise<string> {
  const { id } = await params;
  return id;
}
