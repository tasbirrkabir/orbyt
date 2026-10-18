import { redirect } from "next/navigation";

/**
 * The panel is three rooms now: project, invoices, contact. Any older
 * deep link (approvals, files, settings, the lot) lands back on the
 * project room instead of a dead end. Static routes (invoices,
 * contact) take precedence over this catch-all, so the live rooms are
 * untouched.
 */
export default function WorkspaceRoomRedirect() {
  redirect("/workspace");
}
