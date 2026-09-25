import { COMMAND } from "@/content/command";
import type { PortalModule } from "@/lib/portal/domain";

/**
 * The Command Center navigation model, shared by the desktop sidebar,
 * the mobile drawer and the mobile bottom bar. Items are filtered by
 * the tier's module list, so a client never sees a room their
 * engagement doesn't include.
 */

export type NavItem = { key: PortalModule; label: string; href: string };

export const NAV_GROUPS: { label: string; keys: PortalModule[] }[] = [
  { label: COMMAND.nav.groups.work, keys: ["overview", "projects", "requests", "approvals"] },
  { label: COMMAND.nav.groups.evidence, keys: ["reports", "systems", "activity"] },
  { label: COMMAND.nav.groups.exchange, keys: ["deliverables", "files", "messages", "meetings"] },
  { label: COMMAND.nav.groups.account, keys: ["billing", "team", "support", "settings"] },
];

export function navGroupsForModules(modules: PortalModule[]): { label: string; items: NavItem[] }[] {
  return NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.keys
      .filter((key) => modules.includes(key))
      .map((key) => ({
        key,
        label: COMMAND.nav[key].label,
        href: COMMAND.nav[key].href,
      })),
  })).filter((group) => group.items.length > 0);
}

/** The five mobile priorities, in the order a phone should show them. */
export const MOBILE_PRIMARY: PortalModule[] = ["overview", "projects", "approvals", "messages"];
