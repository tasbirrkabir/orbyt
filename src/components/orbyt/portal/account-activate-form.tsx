"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AUTH } from "@/content/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = "confirm" | "done" | "expired";

/**
 * The owner side of provisioning: the invite email's one-time link
 * lands here with its token; setting a password activates the account
 * and stamps the activation fact server-side. An expired or spent link
 * gets its own honest state with the way back to login.
 */
export function AccountActivateForm({ token }: { token: string | null }) {
  const [stage, setStage] = useState<Stage>(token ? "confirm" : "expired");
  const [clientId, setClientId] = useState("");

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
      {stage === "confirm" && token ? (
        <ConfirmStage
          token={token}
          onDone={(id) => {
            setClientId(id);
            setStage("done");
          }}
          onExpired={() => setStage("expired")}
        />
      ) : null}
      {stage === "done" ? <DoneStage clientId={clientId} /> : null}
      {stage === "expired" ? <ExpiredStage /> : null}
    </div>
  );
}

// ── Stage: pick the password ─────────────────────────────────────

function ConfirmStage({
  token,
  onDone,
  onExpired,
}: {
  token: string;
  onDone: (clientId: string) => void;
  onExpired: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (password.length < 8) {
      setError("At least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError(AUTH.activate.mismatch);
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/invite/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        clientId?: string;
        error?: string;
      } | null;
      if (response.ok) {
        onDone(payload?.clientId ?? "");
        return;
      }
      if (response.status === 400) {
        // Bad, spent or expired token: same honest dead-end state.
        onExpired();
        return;
      }
      setError(payload?.error ?? AUTH.activate.error);
    } catch {
      setError(AUTH.activate.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.activate.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {AUTH.activate.sub}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="activate-password">{AUTH.activate.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="activate-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={AUTH.activate.passwordPlaceholder}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="h-12 pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                aria-label={showPassword ? AUTH.login.hidePassword : AUTH.login.showPassword}
                className="absolute right-0.5 top-0.5 inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activate-confirm">{AUTH.activate.confirmLabel}</Label>
            <Input
              id="activate-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => {
                setConfirm(event.target.value);
                setError("");
              }}
              className="h-12"
            />
          </div>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending || !password || !confirm}
          className="mt-6 h-12 w-full font-semibold"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          {pending ? AUTH.activate.submitting : AUTH.activate.submit}
        </Button>
      </form>
    </>
  );
}

// ── Stage: activated ─────────────────────────────────────────────

function DoneStage({ clientId }: { clientId: string }) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.activate.doneTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {AUTH.activate.doneBody}
      </p>
      {clientId ? (
        <div className="mt-5 rounded-sm border border-border bg-muted/40 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {AUTH.activate.yourClientId}
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-widest text-foreground">
            {clientId}
          </p>
        </div>
      ) : null}
      <Button asChild className="mt-6 h-12 w-full font-semibold">
        <Link href="/login">{AUTH.activate.backToLogin}</Link>
      </Button>
    </>
  );
}

// ── Stage: dead link ─────────────────────────────────────────────

function ExpiredStage() {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        {AUTH.activate.linkExpired}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.activate.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {AUTH.activate.expired}
      </p>
      <Button asChild variant="outline" className="mt-6 h-12 w-full font-semibold">
        <Link href="/login">{AUTH.activate.backToLogin}</Link>
      </Button>
    </>
  );
}
