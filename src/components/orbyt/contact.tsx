"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CONTACT } from "@/content/orbyt";
import { Section } from "./section";
import { Reveal } from "./reveal";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = { name?: string; email?: string; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM = { name: "", email: "", message: "" };

export function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function updateField(
    key: keyof typeof INITIAL_FORM,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!EMAIL_PATTERN.test(form.email.trim()))
      next.email = "Enter a valid email";
    if (!form.message.trim()) next.message = "Required";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Contact request failed: ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
      toast({
        title: "Error",
        description: CONTACT.form.error,
        variant: "destructive",
      });
    }
  }

  function reset() {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
  }

  return (
    <Section id="contact" header={null}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left — pitch + what happens next */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            {CONTACT.eyebrow}
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
          >
            {CONTACT.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {CONTACT.sub}
          </p>

          <div className="mt-10 border border-border bg-card/50 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {CONTACT.next.title}
            </p>
            <ol className="mt-3 divide-y divide-border">
              {CONTACT.next.steps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-baseline gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="shrink-0 font-mono text-xs text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right — form / success state */}
        <Reveal delay={0.1}>
          <div
            aria-live="polite"
            className="rounded-md border border-border bg-card p-6 md:p-8"
          >
            {status === "success" ? (
              <div className="flex min-h-[380px] flex-col items-start justify-center md:min-h-[420px]">
                <div className="flex items-center gap-3">
                  <span className="size-3 bg-primary" aria-hidden="true" />
                  <p className="font-mono text-xs tracking-[0.18em] text-primary">
                    STATUS: RECEIVED
                  </p>
                </div>
                <p className="mt-5 text-lg leading-relaxed">
                  {CONTACT.form.success}
                </p>
                <Button
                  variant="ghost"
                  className="mt-8 h-11 px-4"
                  onClick={reset}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="contact-name"
                      className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {CONTACT.form.nameLabel}
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      placeholder={CONTACT.form.namePlaceholder}
                      className="mt-2 h-11"
                      value={form.name}
                      onChange={(e) => updateField("name", e)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={
                        errors.name ? "contact-name-error" : undefined
                      }
                    />
                    {errors.name ? (
                      <p
                        id="contact-name-error"
                        className="mt-1 font-mono text-[11px] tracking-wider text-destructive"
                      >
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <Label
                      htmlFor="contact-email"
                      className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {CONTACT.form.emailLabel}
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={CONTACT.form.emailPlaceholder}
                      className="mt-2 h-11"
                      value={form.email}
                      onChange={(e) => updateField("email", e)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={
                        errors.email ? "contact-email-error" : undefined
                      }
                    />
                    {errors.email ? (
                      <p
                        id="contact-email-error"
                        className="mt-1 font-mono text-[11px] tracking-wider text-destructive"
                      >
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <Label
                      htmlFor="contact-message"
                      className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {CONTACT.form.messageLabel}
                    </Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder={CONTACT.form.messagePlaceholder}
                      className="mt-2"
                      value={form.message}
                      onChange={(e) => updateField("message", e)}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? "contact-message-error" : undefined
                      }
                    />
                    {errors.message ? (
                      <p
                        id="contact-message-error"
                        className="mt-1 font-mono text-[11px] tracking-wider text-destructive"
                      >
                        {errors.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-8 h-12 w-full text-base font-semibold"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      {CONTACT.form.submitting}
                    </>
                  ) : (
                    CONTACT.form.submit
                  )}
                </Button>
                {status === "error" ? (
                  <p className="mt-3 font-mono text-[11px] tracking-wider text-destructive">
                    {CONTACT.form.error}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
