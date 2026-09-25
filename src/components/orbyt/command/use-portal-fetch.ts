"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/**
 * One fetch hook for every command center room. Each page fetches its
 * own endpoint: any room can load, refetch after an action, and fail
 * honestly on its own. One quiet retry covers the session/API race on
 * a cold load; a real failure surfaces a retry action, never a flash
 * of broken layout.
 */
export function usePortalFetch<T>(endpoint: string) {
  const { status } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    async (mode: "initial" | "retry" | "refresh" = "initial") => {
      if (mode !== "refresh") setLoading(true);
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("request failed");
        const payload = (await response.json()) as T;
        setData(payload);
        setFailed(false);
      } catch {
        if (mode === "retry") {
          setFailed(true);
        } else if (mode === "initial") {
          window.setTimeout(() => {
            void load("retry");
          }, 1200);
        }
      } finally {
        if (mode !== "refresh") setLoading(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    void load("initial");
  }, [status, load]);

  const refresh = useCallback(() => {
    void load("refresh");
  }, [load]);

  return { ready: status === "authenticated", data, loading, failed, refresh, retry: () => void load("retry") };
}
