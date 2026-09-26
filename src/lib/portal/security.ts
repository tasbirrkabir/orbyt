import { PortalAuthError, type PortalContext } from "./session";
import { DEMO_ACCOUNTS } from "@/lib/demo";

/**
 * Guard for the MFA management endpoints. Two-step verification is an
 * owner-seat decision: members and viewers get a clean 403, and the
 * public demo workspaces are refused server-side so a curious visitor
 * can never lock the shared demo account behind an authenticator.
 */
export function requireMfaManager(context: PortalContext): void {
  if (context.role !== "CLIENT_OWNER") {
    throw new PortalAuthError(
      "Only the owner seat manages two-step verification",
      403,
    );
  }
  const isDemo = DEMO_ACCOUNTS.some(
    (account) => account.clientId === context.clientId,
  );
  if (isDemo) {
    throw new PortalAuthError(
      "Demo workspaces keep two-step verification off so everyone can explore",
      403,
    );
  }
}
