"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Compass } from "lucide-react";
import { AUTH } from "@/content/flows";
import {
  DEMO_CLIENT_ID,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/demo";
import { normalizeClientId } from "@/lib/client-id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type FieldErrors = {
  clientId?: string;
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * The client portal sign-in form, shared by the /login page and the
 * locked gate on /workspace. Three factors: the client ID issued when the
 * engagement started, plus email and password.
 *
 * Behavior on success: when `onSignedIn` is provided (the in-place gate)
 * the caller refreshes the session so the portal opens without leaving
 * the page; otherwise the form navigates to `nextPath` (default /workspace).
 */
export function PortalLoginForm({
  nextPath,
  onSignedIn,
  showHeading = true,
  showNoIdPanel = true,
  boxed = true,
}: {
  nextPath?: string | null;
  onSignedIn?: () => void;
  showHeading?: boolean;
  showNoIdPanel?: boolean;
  boxed?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [clientId, setClientId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  // Two-step verification: once the server answers MFA_REQUIRED, the
  // form flips to the code step in place and resubmits with the
  // original three fields plus the code.
  const [mfaStep, setMfaStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState(false);

  function clearError(key: keyof FieldErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedId = normalizeClientId(clientId);
    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (mfaStep) {
      const trimmedCode = code.trim().replace(/\s/g, "");
      if (!trimmedCode) {
        nextErrors.code = AUTH.login.mfaLabel + " is needed";
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      setPending(true);
      try {
        const signInResult = await signIn("credentials", {
          redirect: false,
          clientId: trimmedId,
          email: trimmedEmail,
          password,
          totp: trimmedCode,
        });
        if (signInResult?.ok) {
          if (onSignedIn) {
            onSignedIn();
          } else {
            router.push(nextPath ?? "/workspace");
          }
          return;
        }
        // Wrong code keeps the account invisible behind the same step.
        setErrors({
          code:
            signInResult?.error === "MFA_REQUIRED" ||
            signInResult?.error === "CredentialsSignin"
              ? AUTH.login.mfaWrong
              : AUTH.login.error,
        });
        setPending(false);
      } catch {
        setErrors({ form: AUTH.login.error });
        setPending(false);
      }
      return;
    }

    if (!trimmedId) {
      nextErrors.clientId = "Your client ID opens the portal";
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "That email doesn't look right";
    }
    if (!password) {
      nextErrors.password = "Your password is needed";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const signInResult = await signIn("credentials", {
        redirect: false,
        clientId: trimmedId,
        email: trimmedEmail,
        password,
      });
      if (signInResult?.ok) {
        if (onSignedIn) {
          onSignedIn();
        } else {
          router.push(nextPath ?? "/workspace");
        }
        return;
      }
      if (signInResult?.error === "MFA_REQUIRED") {
        // Right password, second factor expected: show the code step.
        setMfaStep(true);
        setPending(false);
        return;
      }
      setErrors({
        form:
          signInResult?.error === "CredentialsSignin"
            ? AUTH.login.invalid
            : AUTH.login.error,
      });
      setPending(false);
    } catch {
      setErrors({ form: AUTH.login.error });
      setPending(false);
    }
  }

  /**
   * One click into the public demo: provision it (idempotent), sign in
   * with the shared credentials, open the portal. The credentials are
   * public by design; see src/lib/demo.ts.
   */
  async function handleDemo() {
    if (demoPending || pending) return;
    setDemoPending(true);
    setErrors({});

    try {
      const response = await fetch("/api/demo", { method: "POST" });
      if (!response.ok) throw new Error("demo provisioning failed");

      const signInResult = await signIn("credentials", {
        redirect: false,
        clientId: DEMO_CLIENT_ID,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (signInResult?.ok) {
        toast({ title: AUTH.demo.ready });
        if (onSignedIn) {
          onSignedIn();
        } else {
          router.push(nextPath ?? "/workspace");
        }
        return;
      }
      setErrors({ form: AUTH.demo.error });
    } catch {
      setErrors({ form: AUTH.demo.error });
    } finally {
      setDemoPending(false);
    }
  }

  return (
    <div
      className={
        boxed
          ? "w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8"
          : "w-full"
      }
    >
      {showHeading ? (
        <>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
            {AUTH.login.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {AUTH.login.sub}
          </p>
        </>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className={showHeading ? "mt-8" : ""}>
        {mfaStep ? (
          <div className="space-y-5">
            <div>
              <p className="font-display text-lg font-bold leading-snug tracking-tight">
                {AUTH.login.mfaTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {AUTH.login.mfaSub}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-code">{AUTH.login.mfaLabel}</Label>
              <Input
                id="auth-code"
                name="totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={AUTH.login.mfaPlaceholder}
                autoFocus
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  clearError("code");
                }}
                className="h-12 font-mono tracking-[0.4em]"
                aria-invalid={errors.code ? true : undefined}
              />
              <FieldError id="auth-code-error" message={errors.code} />
            </div>
            <button
              type="button"
              onClick={() => {
                setMfaStep(false);
                setCode("");
                setErrors({});
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {AUTH.login.mfaBack}
            </button>
          </div>
        ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="auth-client-id">{AUTH.login.clientIdLabel}</Label>
            <Input
              id="auth-client-id"
              name="clientId"
              placeholder={AUTH.login.clientIdPlaceholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={clientId}
              onChange={(event) => {
                setClientId(event.target.value);
                clearError("clientId");
              }}
              className="h-12 font-mono uppercase tracking-[0.14em]"
              aria-invalid={errors.clientId ? true : undefined}
              aria-describedby={
                errors.clientId ? "auth-client-id-error" : "auth-client-id-hint"
              }
            />
            <p
              id="auth-client-id-hint"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {AUTH.login.clientIdHint}
            </p>
            <FieldError id="auth-client-id-error" message={errors.clientId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-email">{AUTH.login.emailLabel}</Label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={AUTH.login.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "auth-email-error" : undefined}
            />
            <FieldError id="auth-email-error" message={errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">{AUTH.login.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={AUTH.login.passwordPlaceholder}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                className="h-12 pr-14"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? "auth-password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                aria-label={
                  showPassword
                    ? AUTH.login.hidePassword
                    : AUTH.login.showPassword
                }
                className="absolute right-0.5 top-0.5 inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>
            <FieldError id="auth-password-error" message={errors.password} />
          </div>
        </div>
        )}

        {errors.form ? (
          <p
            role="alert"
            className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.form}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="mt-6 h-12 w-full font-semibold"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : null}
          {pending
            ? AUTH.login.submitting
            : mfaStep
              ? AUTH.login.mfaSubmit
              : AUTH.login.submit}
        </Button>
      </form>

      {mfaStep ? null : (
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {AUTH.login.forgot}{" "}
          <Link
            href="/login/reset"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            {AUTH.login.forgotLink}
          </Link>
        </p>
      )}

      <div className="mt-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {AUTH.shared.orDivider}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-5 rounded-md border border-border bg-blueprint p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          {AUTH.demo.eyebrow}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={demoPending || pending}
          onClick={handleDemo}
          className="mt-3 h-12 w-full font-semibold"
        >
          {demoPending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <Compass aria-hidden="true" className="size-4" />
          )}
          {demoPending ? AUTH.demo.submitting : AUTH.demo.label}
        </Button>
        {/* The shared demo credentials, in the open. Public by design. */}
        <p className="mt-3 break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
          {AUTH.demo.credentialsLabel}{" "}
          <span className="text-foreground">
            {DEMO_CLIENT_ID} · {DEMO_EMAIL} · {DEMO_PASSWORD}
          </span>
        </p>
        <p className="mt-1.5 break-words font-mono text-[10px] leading-relaxed text-muted-foreground">
          <span className="text-foreground">ORB-NOVA · nova@orbyt.com · orbyt-nova</span>
          <span aria-hidden="true"> · </span>
          <span className="text-foreground">ORB-ATLAS · atlas@orbyt.com · orbyt-atlas</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {AUTH.demo.note}
        </p>
      </div>

      {showNoIdPanel ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            {AUTH.login.noIdTitle}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {AUTH.login.noIdBody}
          </p>
          <Button asChild variant="outline" className="mt-4 h-11 w-full font-semibold">
            <Link href="/contact">{AUTH.login.noIdCta}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
