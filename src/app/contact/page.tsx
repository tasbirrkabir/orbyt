"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSession } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { CONTACT } from "@/content/orbyt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/orbyt/page-hero";
import { SiteShell } from "@/components/orbyt/site-shell";
import { cn } from "@/lib/utils";

/** Task-specified flow step names (not part of the content files). */
const STEP_LABELS = ["You", "The problem", "Review"] as const;

/** Task-specified control labels (not part of the content files). */
const BACK_LABEL = "Back";
const NEXT_LABEL = "Next";
const EDIT_LABEL = "Edit";

const MESSAGE_MIN_CHARS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactErrors = {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  preformatted,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  preformatted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn(
            "mt-1 break-words text-sm leading-relaxed",
            preformatted && "whitespace-pre-wrap"
          )}
        >
          {value}
        </dd>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onEdit}
        className="h-9 shrink-0 px-2 font-mono text-xs uppercase tracking-[0.18em]"
      >
        {EDIT_LABEL}
      </Button>
    </div>
  );
}

function ContactFlow() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Logged in: default step 1 to the account identity.
  useEffect(() => {
    const user = session?.user;
    if (!user) return;
    setName((prev) => prev || user.name || "");
    setEmail((prev) => prev || user.email || "");
  }, [session]);

  function clearError(key: keyof ContactErrors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function validateStep(current: number): ContactErrors {
    const found: ContactErrors = {};
    if (current === 0) {
      if (!name.trim()) found.name = CONTACT.form.required;
      if (!EMAIL_PATTERN.test(email.trim())) {
        found.email = CONTACT.form.emailInvalid;
      }
    }
    if (current === 1 && message.trim().length < MESSAGE_MIN_CHARS) {
      found.message = CONTACT.form.messageShort;
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
    setStep((prev) => Math.min(prev + 1, 2));
  }

  function goBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function goTo(index: number) {
    if (index > step) return;
    setErrors({});
    setStep(index);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topic ?? undefined,
          message: message.trim(),
        }),
      });
      if (response.ok) {
        setSent(true);
        return;
      }
      setErrors({ form: CONTACT.form.error });
      toast({ title: CONTACT.form.error });
    } catch {
      setErrors({ form: CONTACT.form.error });
      toast({ title: CONTACT.form.error });
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sent) return;
    if (step < 2) {
      goNext();
      return;
    }
    void submit();
  }

  // Enter advances the flow, except inside the textarea where it makes new lines.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.tagName === "A"
    ) {
      return;
    }
    event.preventDefault();
    if (step < 2) {
      goNext();
    } else {
      void submit();
    }
  }

  function reset() {
    setSent(false);
    setStep(0);
    setTopic(null);
    setMessage("");
    setErrors({});
  }

  const submitButton = (
    <Button
      type="submit"
      disabled={submitting}
      className="h-12 px-7 font-semibold"
    >
      {submitting ? (
        <Loader2 aria-hidden="true" className="animate-spin" />
      ) : null}
      {submitting ? CONTACT.form.submitting : CONTACT.form.submit}
    </Button>
  );

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      {/* Steps + what happens next */}
      <div className="lg:sticky lg:top-24">
        <ol aria-label="Contact steps" className="space-y-2">
          {STEP_LABELS.map((label, index) => {
            const active = index === step;
            const complete = index < step;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  disabled={index > step}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 px-2 text-left font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                    active
                      ? "text-primary"
                      : complete
                        ? "text-foreground/80 hover:text-primary"
                        : "cursor-default text-muted-foreground"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-7 shrink-0 place-items-center border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : complete
                          ? "border-primary/50 text-primary"
                          : "border-border"
                    )}
                  >
                    {complete ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        <aside className="mt-10 border border-border p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            {CONTACT.next.title}
          </h2>
          <ol className="mt-4 space-y-3">
            {CONTACT.next.steps.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-xs leading-6 text-foreground/70"
                >
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* Form card */}
      <div className="rounded-md border border-border bg-card">
      {/* Progress between steps */}
      <div className="h-1 overflow-hidden rounded-t-md bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      {sent ? (
        <div className="p-8 text-center sm:p-12">
          <span className="mx-auto grid size-12 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Check aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            STATUS: RECEIVED
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
            {CONTACT.form.successTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {CONTACT.form.success}
          </p>
          <Button
            variant="outline"
            onClick={reset}
            className="mt-8 h-12 px-7 font-semibold"
          >
            {CONTACT.form.again}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleFormSubmit}
          onKeyDown={handleKeyDown}
          noValidate
          aria-label={CONTACT.eyebrow}
        >
          <div className="p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              STEP {step + 1} / 3 : {STEP_LABELS[step]}
            </p>

            {errors.form ? (
              <p
                role="alert"
                className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errors.form}
              </p>
            ) : null}

            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-6 space-y-5"
            >
              {step === 0 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">{CONTACT.form.nameLabel}</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      placeholder={CONTACT.form.namePlaceholder}
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        clearError("name");
                      }}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={
                        errors.name ? "contact-name-error" : undefined
                      }
                    />
                    <FieldError
                      id="contact-name-error"
                      message={errors.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">
                      {CONTACT.form.emailLabel}
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={CONTACT.form.emailPlaceholder}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        clearError("email");
                      }}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={
                        errors.email ? "contact-email-error" : undefined
                      }
                    />
                    <FieldError
                      id="contact-email-error"
                      message={errors.email}
                    />
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <fieldset>
                    <legend className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {CONTACT.form.topicLabel}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {CONTACT.topics.map((item) => {
                        const activeTopic = topic === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={activeTopic}
                            onClick={() =>
                              setTopic(activeTopic ? null : item)
                            }
                            className={cn(
                              "inline-flex h-11 items-center border px-4 font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                              activeTopic
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">
                      {CONTACT.form.messageLabel}
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={6}
                      placeholder={CONTACT.form.messagePlaceholder}
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        clearError("message");
                      }}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? "contact-message-error" : undefined
                      }
                    />
                    <FieldError
                      id="contact-message-error"
                      message={errors.message}
                    />
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {CONTACT.form.reviewTitle}
                  </p>
                  <dl className="mt-4 space-y-4">
                    <ReviewRow
                      label={CONTACT.form.nameLabel}
                      value={name}
                      onEdit={() => goTo(0)}
                    />
                    <ReviewRow
                      label={CONTACT.form.emailLabel}
                      value={email}
                      onEdit={() => goTo(0)}
                    />
                    {topic ? (
                      <ReviewRow
                        label={CONTACT.form.topicLabel}
                        value={topic}
                        onEdit={() => goTo(1)}
                      />
                    ) : null}
                    <ReviewRow
                      label={CONTACT.form.messageLabel}
                      value={message}
                      onEdit={() => goTo(1)}
                      preformatted
                    />
                  </dl>
                </div>
              ) : null}
            </motion.div>

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
              {step < 2 ? (
                <Button type="submit" className="h-11 font-semibold">
                  {NEXT_LABEL}
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                submitButton
              )}
            </div>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="flex-1">
        <PageHero
          id="contact"
          eyebrow={CONTACT.eyebrow}
          title={CONTACT.title}
          lede={CONTACT.sub}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <ContactFlow />
        </div>
      </main>
    </SiteShell>
  );
}
