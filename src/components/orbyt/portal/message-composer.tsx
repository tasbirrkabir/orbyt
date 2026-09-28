"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { PORTAL } from "@/content/flows";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { MeProject } from "@/components/orbyt/dashboard/types";

const COPY = PORTAL.messages;
const NONE = "__none__";

/**
 * The composer that makes the portal two-way: a client note, a topic chip,
 * optional project context. Notes land in the same desk queue as the
 * contact form, so nothing the client says is ever scattered. Replies go
 * out by email; this panel keeps the client's side organized.
 */
export function MessageComposer({
  projects,
  onSent,
}: {
  projects: MeProject[] | null;
  onSent: () => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState<string>(COPY.topics[0]);
  const [projectId, setProjectId] = useState<string>(NONE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = projects ?? [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmed = message.trim();
    if (trimmed.length < 2) {
      setError(COPY.required);
      return;
    }

    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          topic,
          ...(projectId !== NONE ? { projectId } : {}),
        }),
      });
      if (!response.ok) throw new Error("send failed");

      toast({ title: COPY.sent });
      setMessage("");
      setTopic(COPY.topics[0]);
      setProjectId(NONE);
      onSent();
    } catch {
      setError(COPY.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{COPY.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.sub}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        {/* Topic chips: one intent per note keeps the desk queue scannable. */}
        <fieldset>
          <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {COPY.topicLabel}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COPY.topics.map((chip) => {
              const active = chip === topic;
              return (
                <button
                  key={chip}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(chip)}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </fieldset>

        {list.length > 0 ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="portal-note-project">{COPY.projectLabel}</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="portal-note-project" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{COPY.projectNone}</SelectItem>
                {list.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          <Label htmlFor="portal-note-message">{COPY.label}</Label>
          <Textarea
            id="portal-note-message"
            value={message}
            maxLength={2000}
            rows={4}
            placeholder={COPY.placeholder}
            onChange={(event) => {
              setMessage(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            className="resize-none"
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={pending} className="mt-4 h-11 w-full font-semibold">
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <Send aria-hidden="true" className="size-4" />
          )}
          {pending ? COPY.submitting : COPY.submit}
        </Button>
      </form>
    </section>
  );
}
