"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { ONBOARDING, PROTECTED } from "@/content/flows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SiteShell } from "@/components/orbyt/site-shell";
import { cn } from "@/lib/utils";

type WizardData = {
  company: string;
  industry: string;
  stage: string;
  challenges: string[];
  tools: string;
  goal: string;
  focus: string;
};

type StepErrors = Partial<
  Record<"company" | "industry" | "stage" | "challenges" | "goal", string>
>;

type MeProfile = {
  company: string;
  industry: string;
  stage: string;
  challenges: string[] | null;
  tools: string | null;
  goal: string;
};

const EMPTY_DATA: WizardData = {
  company: "",
  industry: "",
  stage: "",
  challenges: [],
  tools: "",
  goal: "",
  focus: "",
};

/** Task-specified control labels (not part of the content files). */
const BACK_LABEL = "Back";
const NEXT_LABEL = "Next";
const SAVE_CHANGES_LABEL = "Save changes";
const EDIT_LABEL = "Edit";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <Loader2 aria-hidden="true" className="size-6 animate-spin text-primary" />
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {PROTECTED.redirecting}
      </p>
    </div>
  );
}

function NeedLoginCard({ next }: { next: string }) {
  return (
    <div className="mx-auto max-w-md rounded-md border border-border bg-card p-8 text-center sm:p-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        {PROTECTED.needLogin.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {PROTECTED.needLogin.body}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild className="h-11 font-semibold">
          <Link href={`/login?next=${next}`}>{PROTECTED.needLogin.login}</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 font-semibold">
          <Link href="/login?mode=register">{PROTECTED.needLogin.register}</Link>
        </Button>
      </div>
    </div>
  );
}

function Wizard() {
  const { toast } = useToast();
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(EMPTY_DATA);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const you = ONBOARDING.steps.you;
  const friction = ONBOARDING.steps.friction;
  const goalCopy = ONBOARDING.steps.goal;
  const review = ONBOARDING.steps.review;

  // Returning user: prefill from the saved profile.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) return;
        const payload = (await response.json()) as { profile?: MeProfile | null };
        if (!active || !payload.profile) return;
        const profile = payload.profile;
        setData((prev) => ({
          ...prev,
          company: profile.company || prev.company,
          industry: profile.industry || prev.industry,
          stage: profile.stage || prev.stage,
          challenges:
            profile.challenges && profile.challenges.length > 0
              ? profile.challenges
              : prev.challenges,
          tools: profile.tools ?? prev.tools,
          goal: profile.goal || prev.goal,
        }));
        setIsEditing(true);
      } catch {
        // Leave the form empty; saving still works from scratch.
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Keep the active step in view when moving through the wizard.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    cardRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [step, reduced]);

  function clearError(key: keyof StepErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function validateStep(current: number): StepErrors {
    const found: StepErrors = {};
    if (current === 0) {
      if (!data.company.trim()) found.company = ONBOARDING.errors.required;
      if (!data.industry) found.industry = ONBOARDING.errors.required;
      if (!data.stage) found.stage = ONBOARDING.errors.required;
    }
    if (current === 1 && data.challenges.length === 0) {
      found.challenges = ONBOARDING.errors.pickOne;
    }
    if (current === 2 && !data.goal.trim()) {
      found.goal = ONBOARDING.errors.required;
    }
    return found;
  }

  function goNext() {
    const found = validateStep(step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function goBack() {
    setErrors({});
    setSubmitError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function goTo(index: number) {
    setErrors({});
    setSubmitError(null);
    setStep(index);
  }

  function toggleChallenge(challenge: string) {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((item) => item !== challenge)
        : [...prev.challenges, challenge],
    }));
    clearError("challenges");
  }

  async function save() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: data.company.trim(),
          industry: data.industry,
          stage: data.stage,
          challenges: data.challenges,
          tools: data.tools.trim() || null,
          goal: data.goal.trim(),
          focus: data.focus.trim() || null,
        }),
      });
      if (response.status === 401) {
        setAuthFailed(true);
        return;
      }
      if (!response.ok) {
        setSubmitError(ONBOARDING.errors.generic);
        return;
      }
      setDone(true);
      toast({ title: review.successTitle, description: review.success });
    } catch {
      setSubmitError(ONBOARDING.errors.generic);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (done) return;
    if (step < 3) {
      goNext();
      return;
    }
    if (!submitting) void save();
  }

  const reviewItems: { label: string; value: string; stepIndex: number }[] = [
    { label: you.companyLabel, value: data.company, stepIndex: 0 },
    { label: you.industryLabel, value: data.industry, stepIndex: 0 },
    { label: you.stageLabel, value: data.stage, stepIndex: 0 },
    ...(data.tools.trim()
      ? [{ label: friction.toolsLabel, value: data.tools, stepIndex: 1 }]
      : []),
    { label: goalCopy.goalLabel, value: data.goal, stepIndex: 2 },
    ...(data.focus.trim()
      ? [{ label: goalCopy.focusLabel, value: data.focus, stepIndex: 2 }]
      : []),
  ];

  if (authFailed) return <NeedLoginCard next="/onboarding" />;

  if (done) {
    return (
      <div
        ref={cardRef}
        className="scroll-mt-24 rounded-md border border-border bg-card p-8 text-center sm:p-12"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-sm bg-primary text-primary-foreground">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">
          {review.successTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {review.success}
        </p>
        <Button asChild className="mt-8 h-12 px-7 font-semibold">
          <Link href="/workspace">{review.toWorkspace}</Link>
        </Button>
      </div>
    );
  }

  const stepTitles = [you.title, friction.title, goalCopy.title, review.title];

  return (
    <div
      ref={cardRef}
      className="scroll-mt-24 rounded-md border border-border bg-card"
    >
      <form onSubmit={handleFormSubmit} noValidate>
        {/* Progress */}
        <div className="border-b border-border p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            STEP {step + 1} / 4 : {ONBOARDING.progressLabels[step]}
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">
            {stepTitles[step]}
          </h2>
          {step === 1 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {friction.titleSub}
            </p>
          ) : null}
          {step === 3 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.sub}
            </p>
          ) : null}
        </div>

        {/* Step body */}
        <div className="p-6 sm:p-8">
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 0 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ob-company">{you.companyLabel}</Label>
                  <Input
                    id="ob-company"
                    value={data.company}
                    onChange={(event) => {
                      setData((prev) => ({
                        ...prev,
                        company: event.target.value,
                      }));
                      clearError("company");
                    }}
                    placeholder={you.companyPlaceholder}
                    aria-invalid={errors.company ? true : undefined}
                    aria-describedby={
                      errors.company ? "ob-company-error" : undefined
                    }
                  />
                  <FieldError id="ob-company-error" message={errors.company} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ob-industry">{you.industryLabel}</Label>
                    <Select
                      value={data.industry || undefined}
                      onValueChange={(value) => {
                        setData((prev) => ({ ...prev, industry: value }));
                        clearError("industry");
                      }}
                    >
                      <SelectTrigger
                        id="ob-industry"
                        className="w-full"
                        aria-invalid={errors.industry ? true : undefined}
                      >
                        <SelectValue placeholder={you.industryPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {you.industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      id="ob-industry-error"
                      message={errors.industry}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ob-stage">{you.stageLabel}</Label>
                    <Select
                      value={data.stage || undefined}
                      onValueChange={(value) => {
                        setData((prev) => ({ ...prev, stage: value }));
                        clearError("stage");
                      }}
                    >
                      <SelectTrigger
                        id="ob-stage"
                        className="w-full"
                        aria-invalid={errors.stage ? true : undefined}
                      >
                        <SelectValue placeholder={you.stagePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {you.stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError id="ob-stage-error" message={errors.stage} />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <p
                    id="ob-challenges-label"
                    className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {friction.challengesLabel}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {friction.challenges.map((challenge) => {
                      const checked = data.challenges.includes(challenge);
                      return (
                        <label
                          key={challenge}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 border p-4 text-sm leading-relaxed transition-colors",
                            checked
                              ? "border-primary/60 bg-primary/5"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleChallenge(challenge)}
                            className="mt-0.5 rounded-none"
                            aria-describedby={
                              errors.challenges
                                ? "ob-challenges-error"
                                : undefined
                            }
                          />
                          <span>{challenge}</span>
                        </label>
                      );
                    })}
                  </div>
                  <FieldError
                    id="ob-challenges-error"
                    message={errors.challenges}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ob-tools">{friction.toolsLabel}</Label>
                  <Textarea
                    id="ob-tools"
                    rows={3}
                    value={data.tools}
                    onChange={(event) =>
                      setData((prev) => ({ ...prev, tools: event.target.value }))
                    }
                    placeholder={friction.toolsPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">
                    {friction.toolsHint}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ob-goal">{goalCopy.goalLabel}</Label>
                  <Textarea
                    id="ob-goal"
                    rows={4}
                    value={data.goal}
                    onChange={(event) => {
                      setData((prev) => ({ ...prev, goal: event.target.value }));
                      clearError("goal");
                    }}
                    placeholder={goalCopy.goalPlaceholder}
                    aria-invalid={errors.goal ? true : undefined}
                    aria-describedby={errors.goal ? "ob-goal-error" : undefined}
                  />
                  <FieldError id="ob-goal-error" message={errors.goal} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-focus">{goalCopy.focusLabel}</Label>
                  <Input
                    id="ob-focus"
                    value={data.focus}
                    onChange={(event) =>
                      setData((prev) => ({ ...prev, focus: event.target.value }))
                    }
                    placeholder={goalCopy.focusPlaceholder}
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div className="space-y-4">
                  {reviewItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {item.value}
                        </dd>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => goTo(item.stepIndex)}
                        className="h-9 shrink-0 px-2 font-mono text-xs uppercase tracking-[0.18em]"
                      >
                        {EDIT_LABEL}
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {friction.challengesLabel}
                      </dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {data.challenges.map((challenge) => (
                          <Badge key={challenge} variant="secondary">
                            {challenge}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goTo(1)}
                      className="h-9 shrink-0 px-2 font-mono text-xs uppercase tracking-[0.18em]"
                    >
                      {EDIT_LABEL}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>

          {submitError ? (
            <p
              role="alert"
              className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}

          {/* Wizard controls */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="h-11"
              >
                <ArrowLeft aria-hidden="true" />
                {BACK_LABEL}
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}
            {step < 3 ? (
              <Button type="submit" className="h-11 font-semibold">
                {NEXT_LABEL}
                <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 font-semibold"
              >
                {submitting ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : null}
                {isEditing
                  ? submitting
                    ? review.submitting
                    : SAVE_CHANGES_LABEL
                  : submitting
                    ? review.submitting
                    : review.submit}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  const { status } = useSession();

  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          {status === "loading" ? <SessionSpinner /> : null}
          {status === "unauthenticated" ? (
            <NeedLoginCard next="/onboarding" />
          ) : null}
          {status === "authenticated" ? (
            <>
              <header className="mb-10">
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {ONBOARDING.title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {ONBOARDING.sub}
                </p>
              </header>
              <Wizard />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {ONBOARDING.edit}
              </p>
            </>
          ) : null}
        </div>
      </main>
    </SiteShell>
  );
}
