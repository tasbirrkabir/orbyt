"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import type { PortalIdentity } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { usePortalFetch } from "./use-portal-fetch";
import { ErrorState, LoadingState, PageHeader } from "./primitives";

const C = COMMAND.contact;

/**
 * The Contact room: one desk, one form, one honest promise. Notes post
 * to the same thread system the crew works from; replies go out by
 * email, usually within one business day. Nothing is auto-answered,
 * nothing is promised that a human doesn't do.
 */
export function CommandContact() {
  const reduced = useReducedMotion();
  // Identity fetch doubles as the load gate: the form needs to know
  // whether this seat may write at all.
  const { data, loading, failed, retry } = usePortalFetch<PortalIdentity>(
    "/api/portal/identity",
  );

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "That did not go through. Try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network trouble. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const canWrite = data.canWrite;

  return (
    <div>
      <PageHeader eyebrow={C.eyebrow} title={C.title} sub={C.sub} />

      <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-8">
        {/* The promise + the elsewhere note */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-6 lg:col-span-2"
        >
          <div className="border border-border bg-card/50 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">The desk</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{C.promise}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              ⏱ {"<"} 1 business day
            </p>
          </div>

          <div className="border border-dashed border-border bg-muted/30 p-5">
            <p className="text-sm font-semibold">{C.elsewhere.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{C.elsewhere.body}</p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href="/contact">{C.elsewhere.cta}</Link>
            </Button>
          </div>
        </motion.div>

        {/* The form */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
          className="lg:col-span-3"
        >
          {sent ? (
            <div className="border border-primary/30 bg-primary/5 p-6 text-center sm:p-10">
              <p aria-hidden="true" className="font-mono text-lg text-primary">✓</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{C.form.sent}</p>
              <Button variant="outline" size="sm" className="mt-5" onClick={() => setSent(false)}>
                Write another
              </Button>
            </div>
          ) : canWrite ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">{C.form.subjectLabel}</Label>
                <Input
                  id="contact-subject"
                  name="subject"
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder={C.form.subjectPlaceholder}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-body">{C.form.messageLabel}</Label>
                <Textarea
                  id="contact-body"
                  name="body"
                  required
                  minLength={2}
                  maxLength={4000}
                  rows={7}
                  placeholder={C.form.messagePlaceholder}
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={busy} className={cn("h-11 w-full font-semibold sm:w-auto")}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {busy ? C.form.submitting : C.form.submit}
              </Button>
            </form>
          ) : (
            <p className="border border-dashed border-border bg-muted/30 px-5 py-6 text-sm leading-relaxed text-muted-foreground">
              {C.viewerNote}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
