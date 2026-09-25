"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { MePayload } from "@/components/orbyt/dashboard/types";

/**
 * One data hook for every portal room. Each workspace page mounts it, so
 * the six routes stay independent: any of them loads, refetches after an
 * action, and fails honestly on its own. No cross-page state to corrupt.
 */
export function usePortalData() {
  const { status } = useSession();
  const [data, setData] = useState<MePayload | null>(null);
  const [failed, setFailed] = useState(false);

  /** Quiet re-fetch after a portal action (note sent, update approved). */
  const refresh = useCallback(() => {
    void (async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) setData((await response.json()) as MePayload);
      } catch {
        // Keep the current view; the next full load retries.
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;

    async function load(isRetry = false) {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) throw new Error("request failed");
        const payload = (await response.json()) as MePayload;
        if (active) {
          setData(payload);
          setFailed(false);
        }
      } catch {
        if (!isRetry) {
          // One quiet retry: sessions and the API can race on a cold load.
          window.setTimeout(() => {
            if (active) void load(true);
          }, 1200);
        } else if (active) {
          setFailed(true);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [status]);

  /** Sign off a shipped update; flips the row on the project log. */
  const approveUpdate = useCallback(
    async (updateId: string) => {
      try {
        const response = await fetch(`/api/portal/updates/${updateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acknowledged: true }),
        });
        if (!response.ok) return false;
        refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh],
  );

  return {
    ready: status === "authenticated",
    data,
    failed,
    refresh,
    approveUpdate,
  };
}
