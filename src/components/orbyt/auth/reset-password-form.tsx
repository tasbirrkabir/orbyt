"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AUTH } from "@/content/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetResponse = {
  error?: string;
};

const MIN_PASSWORD = 10;

/**
 * The /reset-password flow, driven by ?token=. Three states: an invalid
 * or missing token (with a path to request a fresh link), the new
 * password form, and the done state that replaces the form. A 400 from
 * the endpoint is a policy rejection (weak password) and its message
 * is shown verbatim; everything else stays generic.
 */
export function ResetPasswordFlow() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [linkDead, setLinkDead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalid = !token || linkDead;
  const ready = password.length >= MIN_PASSWORD;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || invalid || !ready) return;
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setDone(true);
        return;
      }

      if (response.status === 410) {
        setLinkDead(true);
        return;
      }

      if (response.status === 400) {
        const payload = (await response
          .json()
          .catch(() => null)) as ResetResponse | null;
        setError(
          typeof payload?.error === "string" && payload.error
            ? payload.error
            : AUTH.reset.error,
        );
        return;
      }

      setError(AUTH.reset.error);
    } catch {
      setError(AUTH.reset.error);
    } finally {
      setPending(false);
    }
  }

  if (invalid) {
    return (
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
          {AUTH.reset.title}
        </h1>
        <p role="alert" className="mt-3 text-sm leading-relaxed text-destructive">
          {AUTH.reset.invalidLink}
        </p>
        <Button asChild variant="outline" className="mt-6 h-12 w-full font-semibold">
          <Link href="/forgot-password">{AUTH.reset.requestNew}</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
          {AUTH.reset.doneTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {AUTH.reset.doneBody}
        </p>
        <Button asChild className="mt-6 h-12 w-full font-semibold">
          <Link href="/login">{AUTH.reset.doneCta}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.sub}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-2">
          <Label htmlFor="reset-password">{AUTH.reset.passwordLabel}</Label>
          <div className="relative">
            <Input
              id="reset-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              className="h-12 pr-14"
              aria-invalid={error ? true : undefined}
              aria-describedby="reset-password-hint"
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-pressed={show}
              aria-label={show ? AUTH.login.hidePassword : AUTH.login.showPassword}
              className="absolute right-0.5 top-0.5 inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <p
            id="reset-password-hint"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {AUTH.reset.passwordHint}
          </p>
        </div>

        {error ? (
          <p
            id="reset-form-error"
            role="alert"
            className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending || !ready}
          className="mt-6 h-12 w-full font-semibold"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          {pending ? AUTH.reset.saving : AUTH.reset.submit}
        </Button>
      </form>
    </div>
  );
}
