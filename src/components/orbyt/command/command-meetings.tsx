"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMAND } from "@/content/command";
import { formatDateTime } from "@/lib/portal/domain";
import type { MeetingsPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { EmptyState, ErrorState, LoadingState, Section } from "./primitives";

function CheckInForm() {
  const [day, setDay] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [agenda, setAgenda] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = COMMAND.meetings.checkin.days;
  const windows = COMMAND.meetings.checkin.windows;

  const submit = async () => {
    if (!day || !timeWindow) {
      setError(COMMAND.meetings.checkin.required);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/portal/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, window: timeWindow, agenda: agenda.trim() }),
      });
      if (response.status === 201) {
        toast(COMMAND.meetings.checkin.sent);
        setDay("");
        setTimeWindow("");
        setAgenda("");
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? COMMAND.meetings.checkin.error);
      }
    } catch {
      setError(COMMAND.meetings.checkin.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 border border-border bg-card/50 p-5 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>{COMMAND.meetings.checkin.dayLabel}</Label>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger aria-label={COMMAND.meetings.checkin.dayLabel}>
            <SelectValue placeholder={days[0]} />
          </SelectTrigger>
          <SelectContent>
            {days.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>{COMMAND.meetings.checkin.windowLabel}</Label>
        <Select value={timeWindow} onValueChange={setTimeWindow}>
          <SelectTrigger aria-label={COMMAND.meetings.checkin.windowLabel}>
            <SelectValue placeholder={windows[0]} />
          </SelectTrigger>
          <SelectContent>
            {windows.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="checkin-agenda">{COMMAND.meetings.checkin.agendaLabel}</Label>
        <Textarea
          id="checkin-agenda"
          value={agenda}
          onChange={(event) => setAgenda(event.target.value)}
          placeholder={COMMAND.meetings.checkin.agendaPlaceholder}
          rows={3}
          maxLength={600}
        />
      </div>
      <div className="sm:col-span-2">
        {error ? (
          <p role="status" className="mb-3 border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}
        <Button onClick={() => void submit()} disabled={submitting} className="text-[#1B1B1A]">
          {submitting ? COMMAND.meetings.checkin.submitting : COMMAND.meetings.checkin.submit}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{COMMAND.meetings.joinNote}</p>
      </div>
    </div>
  );
}

export function CommandMeetings() {
  const { data, loading, failed, retry } = usePortalFetch<MeetingsPayload>("/api/portal/meetings");
  const reduced = useReducedMotion();

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const canRequest = data.identity.canWrite;

  return (
    <div>
      <header className="mb-8 sm:mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{COMMAND.meetings.eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{COMMAND.meetings.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{COMMAND.meetings.sub}</p>
      </header>

      <div className="grid min-w-0 gap-10 lg:grid-cols-2">
        {/* Upcoming */}
        <section aria-label={COMMAND.meetings.upcoming}>
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {COMMAND.meetings.upcoming}
          </h2>
          {data.upcoming.length === 0 ? (
            <EmptyState title={COMMAND.meetings.emptyUpcoming} body={COMMAND.meetings.checkin.sub} />
          ) : (
            <ul role="list" className="space-y-4">
              {data.upcoming.map((meeting, index) => (
                <motion.li
                  key={meeting.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                  className="border-l-2 border-primary bg-card/50 p-5"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                    {formatDateTime(meeting.startsAt)} · {COMMAND.meetings.minutes(meeting.durationMins)}
                  </p>
                  <p className="mt-1.5 font-display text-base font-bold leading-snug">{meeting.title}</p>
                  {meeting.agenda ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{COMMAND.meetings.agenda}: </span>
                      {meeting.agenda}
                    </p>
                  ) : null}
                  {meeting.projectTitle ? (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {meeting.projectTitle}
                    </p>
                  ) : null}
                  <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                    {COMMAND.meetings.joinNote}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* Past */}
        <section aria-label={COMMAND.meetings.past}>
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {COMMAND.meetings.past}
          </h2>
          {data.past.length === 0 ? (
            <EmptyState title={COMMAND.meetings.emptyPast} body={COMMAND.activity.empty} />
          ) : (
            <ul role="list" className="space-y-4">
              {data.past.map((meeting) => (
                <li key={meeting.id} className="border border-border bg-card/50 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {formatDateTime(meeting.startsAt)} · {COMMAND.meetings.minutes(meeting.durationMins)}
                  </p>
                  <p className="mt-1.5 font-display text-base font-bold leading-snug">{meeting.title}</p>
                  {meeting.notes ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{COMMAND.meetings.notes}: </span>
                      {meeting.notes}
                    </p>
                  ) : null}
                  {meeting.decisions ? (
                    <p className="mt-2 border-l-2 border-primary/50 pl-3 text-sm leading-relaxed">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {COMMAND.meetings.decisions}:{" "}
                      </span>
                      {meeting.decisions}
                    </p>
                  ) : null}
                  {meeting.projectTitle ? (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {meeting.projectTitle}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Check-in request */}
      <Section label={COMMAND.meetings.checkin.label} className="!mt-12">
        <div className="max-w-3xl">
          <h3 className="font-display text-base font-bold">{COMMAND.meetings.checkin.title}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {COMMAND.meetings.checkin.sub}
          </p>
          <div className="mt-5">
            {canRequest ? (
              <CheckInForm />
            ) : (
              <p className="border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {COMMAND.meetings.viewerNote}
              </p>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
