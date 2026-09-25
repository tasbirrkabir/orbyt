"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Compass } from "lucide-react";
import { AUTH } from "@/content/flows";
import { FOOTER, HERO } from "@/content/orbyt";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SiteShell } from "@/components/orbyt/site-shell";

type Mode = "login" | "register";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LogoTile() {
  return (
    <div className="shadow-pixel-orange">
      <div
        className="overflow-hidden rounded-md border border-border"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)",
        }}
      >
        <Image
          src="/orbyt-logo.png"
          alt="ORBYT logo: a black pixel runner on an orange tile"
          width={1189}
          height={1323}
          sizes="(min-width: 1024px) 320px, 60vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

/** Left brand rail: logo tile, the promise, the tag. Desktop only. */
function BrandRail() {
  return (
    <aside className="relative hidden border-b border-border bg-blueprint lg:flex lg:flex-col lg:justify-between lg:gap-12 lg:border-b-0 lg:border-r lg:p-12">
      <Link
        href="/"
        className="inline-flex h-11 items-center self-start font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
      >
        {AUTH.shared.backHome}
      </Link>

      <div className="mx-auto w-full max-w-xs py-16">
        <LogoTile />
        <p className="mt-10 font-display text-2xl font-bold leading-snug tracking-tight">
          {HERO.titleA} {HERO.titleB}
        </p>
        <p className="mt-5 font-mono text-xs tracking-widest text-muted-foreground">
          {FOOTER.tag}
        </p>
      </div>

      <p
        aria-hidden="true"
        className="select-none font-mono text-lg leading-none text-foreground/15"
      >
        +
      </p>
    </aside>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function AuthCard() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>(() =>
    params.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState(false);

  const nextPath = params.get("next");
  const copy = mode === "login" ? AUTH.login : AUTH.register;

  /**
   * One click into the public demo: provision it (idempotent), sign in
   * with the shared credentials, land in the workspace. The credentials
   * are public by design; see src/lib/demo.ts.
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
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (signInResult?.ok) {
        toast({ title: AUTH.demo.ready });
        router.push(nextPath ?? "/dashboard");
        return;
      }
      setErrors({ form: AUTH.demo.error });
    } catch {
      setErrors({ form: AUTH.demo.error });
    } finally {
      setDemoPending(false);
    }
  }

  function switchMode(target: Mode) {
    setMode(target);
    setErrors({});
    setShowPassword(false);
  }

  function clearError(key: keyof FieldErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (mode === "register" && trimmedName.length < 2) {
      nextErrors.name = AUTH.register.nameRequired;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = AUTH.register.emailInvalid;
    }
    if (mode === "register" && password.length < 8) {
      nextErrors.password = AUTH.register.passwordShort;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
          }),
        });

        if (response.status === 409) {
          setErrors({ email: AUTH.register.emailTaken });
          setPending(false);
          return;
        }
        if (!response.ok) {
          setErrors({ form: AUTH.register.error });
          setPending(false);
          return;
        }

        const signInResult = await signIn("credentials", {
          redirect: false,
          email: trimmedEmail,
          password,
        });
        if (signInResult?.ok) {
          toast({ title: AUTH.shared.welcomeNew });
          router.push(nextPath ?? "/onboarding");
          return;
        }
        setErrors({ form: AUTH.login.error });
        setPending(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: trimmedEmail,
        password,
      });
      if (signInResult?.ok) {
        router.push(nextPath ?? "/dashboard");
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
      setErrors({
        form: mode === "register" ? AUTH.register.error : AUTH.login.error,
      });
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 sm:p-8">
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
        {copy.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {copy.sub}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        <div className="space-y-5">
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-name">{AUTH.register.nameLabel}</Label>
              <Input
                id="auth-name"
                name="name"
                autoComplete="name"
                placeholder={AUTH.register.namePlaceholder}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "auth-name-error" : undefined}
              />
              <FieldError id="auth-name-error" message={errors.name} />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="auth-email">{copy.emailLabel}</Label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
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
            <Label htmlFor="auth-password">{copy.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                className="h-12 pr-14"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password
                    ? "auth-password-error"
                    : mode === "register"
                      ? "auth-password-hint"
                      : undefined
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
            {mode === "register" ? (
              <p
                id="auth-password-hint"
                className="text-xs text-muted-foreground"
              >
                {AUTH.register.passwordHint}
              </p>
            ) : null}
            <FieldError id="auth-password-error" message={errors.password} />
          </div>
        </div>

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
          {pending ? copy.submitting : copy.submit}
        </Button>
      </form>

      {mode === "login" ? (
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {AUTH.login.forgot}
        </p>
      ) : null}

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
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {AUTH.demo.note}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? AUTH.login.noAccount : AUTH.register.haveAccount}
        </p>
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
          className="inline-flex h-11 items-center font-mono text-xs uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80"
        >
          {mode === "login"
            ? AUTH.login.switchToRegister
            : AUTH.register.switchToLogin}
        </button>
      </div>
    </div>
  );
}

function AuthFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center gap-3 py-24">
      <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {AUTH.login.submitting}
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2">
          <BrandRail />
          <div className="flex items-center justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <Suspense fallback={<AuthFallback />}>
              <AuthCard />
            </Suspense>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
