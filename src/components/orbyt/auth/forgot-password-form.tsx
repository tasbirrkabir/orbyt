"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AUTH } from "@/content/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The /forgot-password form. POSTs to /api/auth/password/forgot and, on
 * a 200, always shows the sent state: the endpoint is non-enumerating,
 * so the UI never confirms whether an address has an account.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = EMAIL_PATTERN.test(email.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !ready) return;
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      // A 200 is the only signal and it never says the address exists.
      if (response.ok) {
        setSent(true);
        return;
      }
      setError(AUTH.forgot.error);
    } catch {
      setError(AUTH.forgot.error);
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
          {AUTH.forgot.sentTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {AUTH.forgot.sentBody}
        </p>
        <Button asChild variant="outline" className="mt-6 h-12 w-full font-semibold">
          <Link href="/login">{AUTH.forgot.backToLogin}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {AUTH.forgot.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {AUTH.forgot.sub}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">{AUTH.forgot.emailLabel}</Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={AUTH.forgot.emailPlaceholder}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            className="h-12"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "forgot-form-error" : undefined}
          />
        </div>

        {error ? (
          <p
            id="forgot-form-error"
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
          {pending ? AUTH.forgot.sending : AUTH.forgot.submit}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-5 inline-flex h-11 items-center font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        {AUTH.forgot.backToLogin}
      </Link>
    </div>
  );
}
