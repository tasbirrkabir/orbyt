import { COMMAND } from "@/content/command";

/**
 * The Command Center navigation model, shared by the desktop sidebar
 * and the mobile bottom bar. The panel is deliberately small:
 * project, invoices, contact. No tier filtering, no hidden rooms.
 */

export type NavItem = { key: string; label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { key: "project", label: COMMAND.nav.project.label, href: COMMAND.nav.project.href },
  { key: "invoices", label: COMMAND.nav.invoices.label, href: COMMAND.nav.invoices.href },
  { key: "contact", label: COMMAND.nav.contact.label, href: COMMAND.nav.contact.href },
];

export function navItems(): NavItem[] {
  return NAV_ITEMS;
}
