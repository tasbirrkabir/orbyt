"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { STAFF } from "@/content/admin";
import { DEMO_ADMIN } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChallengeResponse = {
  mfaRequired?: boolean;
  ticket?: string;
};

/**
 * The staff sign-in form: email and password, no client ID. A client
 * seat cannot open the desk; the server rejects it and the copy says
 * where clients belong.
 *
 * Two-step MFA: staff seats can carry an active MFA enrollment, so step
 * one verifies the credentials against /api/auth/mfa/challenge without
 * opening a session. { mfaRequired: true, ticket } moves the form to the
 * code step and the signIn completes with the ticket plus the code. The
 * ticket is single use and a wrong code burns it, so a failed verify
 * returns to step one for a fresh challenge.
 */
export function AdminLoginForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [mfaTicket, setMfaTicket] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (step === "code") {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          mfaTicket,
          mfaCode: code,
        });
        if (result?.error) {
          // The ticket was consumed on the failed verify: the only
          // honest retry is step one with a fresh challenge.
          setMfaTicket("");
          setCode("");
          setStep("credentials");
          setError(STAFF.shell.gate.invalid);
          return;
        }
        onSignedIn?.();
        router.refresh();
        return;
      }

      const response = await fetch("/api/auth/mfa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const payload = (await response
          .json()
          .catch(() => null)) as ChallengeResponse | null;

        if (
          payload?.mfaRequired === true &&
          typeof payload.ticket === "string" &&
          payload.ticket
        ) {
          setMfaTicket(payload.ticket);
          setCode("");
          setStep("code");
          return;
        }

        if (payload?.mfaRequired === false) {
          const result = await signIn("credentials", {
            redirect: false,
            email: email.trim(),
            password,
          });
          if (result?.error) {
            setError(STAFF.shell.gate.invalid);
            return;
          }
          onSignedIn?.();
          router.refresh();
          return;
        }
      }

      setError(STAFF.shell.gate.invalid);
    } catch {
      setError(STAFF.shell.gate.invalid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {step === "code" ? (
        <div className="space-y-1.5">
          <Label htmlFor="staff-mfa-code" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {STAFF.shell.gate.mfaLabel}
          </Label>
          <Input
            id="staff-mfa-code"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="off"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError(null);
            }}
            className="border-border bg-background font-mono tracking-[0.2em]"
            autoFocus
          />
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="staff-email" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {STAFF.shell.gate.emailLabel}
            </Label>
            <Input
              id="staff-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-border bg-background"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-password" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {STAFF.shell.gate.passwordLabel}
            </Label>
            <div className="relative">
              <Input
                id="staff-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-border bg-background pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </>
      )}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={busy || (step === "code" && !code.trim())}
        className="w-full font-semibold"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {STAFF.shell.gate.submitting}
          </span>
        ) : step === "code" ? (
          STAFF.shell.gate.mfaSubmit
        ) : (
          STAFF.shell.gate.submit
        )}
      </Button>

      <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <span className="mr-2 inline-block bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#1B1B1A]">
          {STAFF.shell.gate.demoTag}
        </span>
        {STAFF.shell.gate.demoNote}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="font-mono text-[10px] uppercase tracking-[0.16em] underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {STAFF.shell.gate.portalLink}
        </Link>
      </p>
    </form>
  );
}
