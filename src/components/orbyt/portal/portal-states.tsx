"use client";

import { CONTACT } from "@/content/orbyt";
import { PROTECTED } from "@/content/flows";

/** The quiet loading state every portal room shares. */
export function PortalLoading() {
  return (
    <div className="flex flex-col items-center gap-4 py-24" role="status">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {PROTECTED.redirecting}
      </p>
    </div>
  );
}

/** The honest failure state: name what happened, keep the tone level. */
export function PortalLoadError() {
  return (
    <div className="mt-10 rounded-md border border-destructive/40 bg-destructive/10 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-destructive">
        ERROR
      </p>
      <p className="mt-2 text-sm leading-relaxed text-destructive">
        {CONTACT.form.error}
      </p>
    </div>
  );
}
