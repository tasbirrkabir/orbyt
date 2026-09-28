"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * One state machine behind the two-step verification panels (client
 * command center and staff console share the endpoints and the flow,
 * each surface brings its own copy and chrome).
 *
 * Endpoints (same contract for both surfaces):
 * - GET  /api/auth/mfa/status  -> { active, pending } | 401
 * - POST /api/auth/mfa/setup   -> { secret, uri } | 401 | 429 | 500
 * - POST /api/auth/mfa/verify  -> { backupCodes, tokenVersion } | 400 | 429
 * - POST /api/auth/mfa/disable -> { tokenVersion } | 400 | 429
 *
 * A 401 is a dead session: dropped in place with signOut so the shell
 * flips back to its gate, exactly like the rooms' shared fetch hook.
 * Verify and disable bump the account tokenVersion server side and
 * every other session dies; the current one is kept alive by merging
 * the new version into the session via useSession().update({ tv }).
 */

export type MfaPhase = "loading" | "off" | "on" | "failed";
export type MfaStep = "status" | "setup" | "backup";

/** The only strings the flow itself needs; both content objects carry them. */
export type MfaFlowCopy = {
  /** 400 fallback: what the user typed did not match. */
  wrong: string;
  /** 429, 500 or network failure fallback on the mutation endpoints. */
  error: string;
};

type StatusPayload = { active?: unknown; pending?: unknown };

export function useMfaFlow(copy: MfaFlowCopy) {
  const { update } = useSession();
  const [phase, setPhase] = useState<MfaPhase>("loading");
  const [step, setStep] = useState<MfaStep>("status");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async (mode: "initial" | "retry" | "refresh" = "initial") => {
    try {
      const response = await fetch("/api/auth/mfa/status");
      if (response.status === 401) {
        void signOut({ redirect: false });
        return;
      }
      if (!response.ok) throw new Error("status request failed");
      const payload = (await response.json()) as StatusPayload;
      setPhase(payload.active === true ? "on" : "off");
    } catch {
      if (mode === "retry") {
        setPhase("failed");
      } else if (mode === "initial") {
        // One quiet retry covers the session/API race on a cold load,
        // same rule as the rooms' shared fetch hook.
        window.setTimeout(() => {
          void loadStatus("retry");
        }, 1200);
      }
      // A refresh failure keeps the last known phase on screen.
    }
  }, []);

  useEffect(() => {
    void loadStatus("initial");
  }, [loadStatus]);

  /** Begin enrollment: fetches the secret and its otpauth:// form. */
  const start = useCallback(async (): Promise<boolean> => {
    setStarting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/mfa/setup", { method: "POST" });
      if (response.status === 401) {
        void signOut({ redirect: false });
        return false;
      }
      if (!response.ok) {
        setError(copy.error);
        return false;
      }
      const payload = (await response.json()) as { secret?: string; uri?: string };
      setSecret(typeof payload.secret === "string" ? payload.secret : "");
      setUri(typeof payload.uri === "string" ? payload.uri : "");
      setCode("");
      setBackupCodes([]);
      setStep("setup");
      return true;
    } catch {
      setError(copy.error);
      return false;
    } finally {
      setStarting(false);
    }
  }, [copy.error]);

  /** Confirm the enrollment with the first authenticator code. */
  const confirm = useCallback(async (): Promise<boolean> => {
    setConfirming(true);
    setError("");
    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (response.status === 401) {
        void signOut({ redirect: false });
        return false;
      }
      const payload = (await response.json().catch(() => null)) as
        | { backupCodes?: unknown; tokenVersion?: unknown; error?: unknown }
        | null;
      if (!response.ok) {
        if (response.status === 400) {
          setError(
            typeof payload?.error === "string" && payload.error ? payload.error : copy.wrong,
          );
        } else {
          setError(copy.error);
        }
        return false;
      }

      const codes = Array.isArray(payload?.backupCodes)
        ? payload.backupCodes.filter((entry): entry is string => typeof entry === "string")
        : [];
      setBackupCodes(codes);
      setCode("");
      setPhase("on");
      setStep("backup");

      // The server bumped tokenVersion: every other session died. Keep
      // this one alive by merging the new version into the session.
      if (typeof payload?.tokenVersion === "number") {
        await update({ tv: payload.tokenVersion });
      }
      void loadStatus("refresh");
      return true;
    } catch {
      setError(copy.error);
      return false;
    } finally {
      setConfirming(false);
    }
  }, [code, copy.error, copy.wrong, loadStatus, update]);

  /** Turn the second factor off; password required, live code when active. */
  const disable = useCallback(
    async (password: string, secondCode?: string): Promise<boolean> => {
      setDisabling(true);
      setError("");
      try {
        const response = await fetch("/api/auth/mfa/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secondCode ? { password, code: secondCode } : { password }),
        });
        if (response.status === 401) {
          void signOut({ redirect: false });
          return false;
        }
        const payload = (await response.json().catch(() => null)) as
          | { tokenVersion?: unknown; error?: unknown }
          | null;
        if (!response.ok) {
          if (response.status === 400) {
            setError(
              typeof payload?.error === "string" && payload.error ? payload.error : copy.wrong,
            );
          } else {
            setError(copy.error);
          }
          return false;
        }

        setPhase("off");
        setStep("status");
        if (typeof payload?.tokenVersion === "number") {
          await update({ tv: payload.tokenVersion });
        }
        void loadStatus("refresh");
        return true;
      } catch {
        setError(copy.error);
        return false;
      } finally {
        setDisabling(false);
      }
    },
    [copy.error, copy.wrong, loadStatus, update],
  );

  /** Leave the flow (dialog closed): drop secrets and read live status. */
  const closeFlow = useCallback(() => {
    setStep("status");
    setSecret("");
    setUri("");
    setCode("");
    setBackupCodes([]);
    setError("");
    void loadStatus("refresh");
  }, [loadStatus]);

  return {
    phase,
    step,
    secret,
    uri,
    code,
    setCode,
    backupCodes,
    starting,
    confirming,
    disabling,
    error,
    start,
    confirm,
    disable,
    closeFlow,
    retryStatus: () => void loadStatus("retry"),
  };
}
