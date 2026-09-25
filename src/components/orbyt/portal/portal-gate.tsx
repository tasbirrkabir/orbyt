"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AUTH, DASHBOARD, PROTECTED } from "@/content/flows";
import { ConsoleFrame } from "@/components/orbyt/dashboard/console-frame";
import { PortalLoginForm } from "./portal-login-form";

/**
 * The locked state of /workspace: the login portal itself, rendered in
 * place on the same console plate the workspace uses. Signing in flips
 * the session and the gate hands over to the portal without a redirect.
 */
export function PortalGate({
  next,
  onSignedIn,
}: {
  next: string;
  onSignedIn?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl"
    >
      <ConsoleFrame
        activeLabel={DASHBOARD.console.standby}
        sessionLabel={DASHBOARD.console.locked}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {PROTECTED.gate.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {AUTH.login.title}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {PROTECTED.gate.sub}
        </p>

        <div className="mx-auto mt-8 w-full max-w-md">
          <PortalLoginForm
            nextPath={next}
            onSignedIn={onSignedIn}
            showHeading={false}
            showNoIdPanel={false}
            boxed={false}
          />
        </div>

        <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          {PROTECTED.gate.noId}{" "}
          <Link
            href="/contact"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {PROTECTED.gate.noIdCta}
          </Link>
          . {PROTECTED.gate.noIdTail}
        </p>
      </ConsoleFrame>
    </motion.div>
  );
}
