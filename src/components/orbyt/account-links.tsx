"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Footer account list, session-aware: guests see Log in, clients see their
 * portal. Mirrors the header's account nav so no route shows both.
 */
export function FooterAccountLinks({ itemClassName }: { itemClassName: string }) {
  const { status } = useSession();

  if (status === "loading") return null;

  const links =
    status === "authenticated"
      ? [{ label: "Workspace", href: "/workspace" }]
      : [{ label: "Log in", href: "/login" }];

  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={itemClassName}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
