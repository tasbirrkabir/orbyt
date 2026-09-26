"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AUTH } from "@/content/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "request" | "sent" | "confirm" | "done" | "expired";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * Self-service password recovery, both halves in one component:
 *  - request: mailbox in, generic confirmation out (no enumeration)
 *  - confirm: the one-time link's token plus the new password; an
 *    expired or spent link flips to its own state with a way back.
 */
export function PasswordResetForms({ token }: { token: string | null }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(token ? "confirm" : "request");

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
      {stage === "request" ? (
        <RequestStage onRequested={() => setStage("sent")} />
      ) : null}
      {stage === "sent" ? (
        <SentStage onResend={() => setStage("request")} />
      ) : null}
      {stage === "confirm" && token ? (
        <ConfirmStage
          token={token}
          onDone={() => setStage("done")}
          onExpired={() => setStage("expired")}
        />
      ) : null}
      {stage === "expired" ? (
        <ExpiredStage onRequested={() => setStage("sent")} />
      ) : null}
      {stage === "done" ? <DoneStage /> : null}
    </div>
  );
}

// ── Stage: ask for the link ──────────────────────────────────────

function RequestStage({ onRequested }: { onRequested: () => void }) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.sub}
      </p>
      <EmailForm
        submitLabel={AUTH.reset.submit}
        onRequested={onRequested}
      />
    </>
  );
}

// ── Stage: generic confirmation ──────────────────────────────────

function SentStage({ onResend }: { onResend: () => void }) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.sentTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.sentBody}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="h-11 font-semibold">
          <Link href="/login">{AUTH.reset.backToLogin}</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 font-semibold text-muted-foreground"
          onClick={onResend}
        >
          {AUTH.reset.sendNew}
        </Button>
      </div>
    </>
  );
}

// ── Stage: choose the new password ───────────────────────────────

function ConfirmStage({
  token,
  onDone,
  onExpired,
}: {
  token: string;
  onDone: () => void;
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
      setError(AUTH.reset.mismatch);
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (response.ok) {
        onDone();
        return;
      }
      if (response.status === 400) {
        // Expired or already spent: give the visitor a way back.
        onExpired();
        return;
      }
      setError(payload?.error ?? AUTH.reset.confirmError);
    } catch {
      setError(AUTH.reset.confirmError);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.confirmTitle}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.confirmSub}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reset-password">{AUTH.reset.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={AUTH.reset.passwordPlaceholder}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            <Label htmlFor="reset-confirm">{AUTH.reset.confirmLabel}</Label>
            <Input
              id="reset-confirm"
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
          {pending ? AUTH.reset.confirmSubmitting : AUTH.reset.confirmSubmit}
        </Button>
      </form>
    </>
  );
}

// ── Stage: dead link ─────────────────────────────────────────────

function ExpiredStage({ onRequested }: { onRequested: () => void }) {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        {AUTH.reset.linkExpired}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.confirmTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.expired}
      </p>
      <EmailForm
        submitLabel={AUTH.reset.sendNew}
        onRequested={onRequested}
      />
    </>
  );
}

// ── Stage: saved ─────────────────────────────────────────────────

function DoneStage() {
  const router = useRouter();
  return (
    <>
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.reset.doneTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {AUTH.reset.doneBody}
      </p>
      <Button
        className="mt-6 h-12 w-full font-semibold"
        onClick={() => router.push("/login")}
      >
        {AUTH.reset.backToLogin}
      </Button>
    </>
  );
}

// ── Shared: the mailbox form ─────────────────────────────────────

function EmailForm({
  submitLabel,
  onRequested,
}: {
  submitLabel: string;
  onRequested: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("That email doesn't look right");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok && response.status !== 429) {
        setError(AUTH.reset.requestError);
        setPending(false);
        return;
      }
      onRequested();
    } catch {
      setError(AUTH.reset.requestError);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-2">
          <Label htmlFor="reset-email">{AUTH.reset.emailLabel}</Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder={AUTH.reset.emailPlaceholder}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            className="h-12"
          />
          <FieldError message={error} />
        </div>
        <Button
          type="submit"
          disabled={pending || !email}
          className="mt-6 h-12 w-full font-semibold"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          {pending ? AUTH.reset.submitting : submitLabel}
        </Button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          {AUTH.reset.backToLogin}
        </Link>
      </p>
    </>
  );
}
