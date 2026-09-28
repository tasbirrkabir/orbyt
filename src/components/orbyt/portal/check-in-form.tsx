"use client";

import { useState, type FormEvent } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
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

const COPY = PORTAL.support.checkin;

/**
 * The honest way to ask for a meeting: pick a day and a window, add an
 * agenda if you want, and the request lands on the desk as a structured
 * note (topic "Check-in request"). We confirm a time by email. No calendar
 * embeds pretending to read anyone's availability.
 */
export function CheckInForm() {
  const { toast } = useToast();
  const [day, setDay] = useState<string>(COPY.days[0]);
  const [window, setWindow] = useState<string>(COPY.windows[0]);
  const [agenda, setAgenda] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);

    const trimmed = agenda.trim();
    const message = `Check-in requested: ${day}, ${window}. Agenda: ${
      trimmed.length > 0 ? trimmed : "open floor."
    }`;

    try {
      const response = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, topic: "Check-in request" }),
      });
      if (!response.ok) throw new Error("send failed");

      toast({ title: COPY.sent });
      setAgenda("");
      setDay(COPY.days[0]);
      setWindow(COPY.windows[0]);
    } catch {
      setError(COPY.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label={COPY.title} className="border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-primary/50 text-primary"
        >
          <CalendarCheck className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {COPY.label}
          </p>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
            {COPY.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {COPY.sub}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="checkin-day">{COPY.dayLabel}</Label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger id="checkin-day" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COPY.days.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkin-window">{COPY.windowLabel}</Label>
          <Select value={window} onValueChange={setWindow}>
            <SelectTrigger id="checkin-window" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COPY.windows.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="checkin-agenda">{COPY.agendaLabel}</Label>
          <Textarea
            id="checkin-agenda"
            value={agenda}
            maxLength={600}
            rows={3}
            placeholder={COPY.agendaPlaceholder}
            onChange={(event) => {
              setAgenda(event.target.value);
              if (error) setError(null);
            }}
            className="resize-none"
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full font-semibold sm:col-span-2"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <CalendarCheck aria-hidden="true" className="size-4" />
          )}
          {pending ? COPY.submitting : COPY.submit}
        </Button>
      </form>
    </section>
  );
}
