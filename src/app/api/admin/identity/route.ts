import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/admin/api";
import type { AdminIdentity } from "@/lib/admin/types";

/**
 * GET /api/admin/identity (staff only)
 * 200 { identity: AdminIdentity } | 401
 */
export async function GET() {
  return adminRoute(async (context) => {
    const identity: AdminIdentity = {
      name: context.name,
      email: context.email,
      role: "ADMIN",
    };
    return NextResponse.json({ identity });
  });
}
