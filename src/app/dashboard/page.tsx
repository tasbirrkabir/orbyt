"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { format } from "date-fns";
import { DASHBOARD, PROTECTED } from "@/content/flows";
import { CONTACT, FOOTER } from "@/content/orbyt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/orbyt/site-shell";

type MeProfile = {
  company: string;
  industry: string;
  stage: string;
  challenges: string[] | null;
  tools: string | null;
  goal: string;
};

type MeSubmission = {
  id: string;
  topic: string | null;
  message: string;
  createdAt: string;
};

type MePayload = {
  user: { name: string | null; email: string };
  profile: MeProfile | null;
  submissions: MeSubmission[] | null;
};

const MESSAGE_PREVIEW_CHARS = 140;

/** Mono status token, same language as the contact success panel. */
const ERROR_LABEL = "ERROR";

function truncateMessage(message: string) {
  return message.length > MESSAGE_PREVIEW_CHARS
    ? `${message.slice(0, MESSAGE_PREVIEW_CHARS).trimEnd()}…`
    : message;
}

function greetingFor(hour: number) {
  if (hour < 12) return DASHBOARD.greeting.morning;
  if (hour < 18) return DASHBOARD.greeting.afternoon;
  return DASHBOARD.greeting.evening;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

function SessionSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
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

function SkeletonCards() {
  return (
    <div aria-hidden="true" className="mt-10 grid gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((card) => (
        <div key={card} className="rounded-xl border bg-card p-6">
          <div className="h-4 w-1/3 animate-pulse bg-muted" />
          <div className="mt-3 h-3 w-2/3 animate-pulse bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-3 w-full animate-pulse bg-muted" />
            <div className="h-3 w-5/6 animate-pulse bg-muted" />
            <div className="h-3 w-4/6 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardBody({ data }: { data: MePayload }) {
  const profileCopy = DASHBOARD.cards.profile;
  const messagesCopy = DASHBOARD.cards.messages;
  const nextCopy = DASHBOARD.cards.next;

  const greeting = greetingFor(new Date().getHours());
  const displayName = data.user.name || data.user.email;
  const submissions = data.submissions ?? [];

  return (
    <>
      {/* Header: greeting, identity, sign out */}
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            {FOOTER.accountLinks[1].label}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {greeting}, {displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {DASHBOARD.sub}
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {DASHBOARD.signedInAs}{" "}
            <span className="text-foreground">{data.user.email}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="h-11 shrink-0 font-semibold"
        >
          {DASHBOARD.signOut}
        </Button>
      </header>

      {/* Cards */}
      <div className="mt-10 grid items-start gap-6 lg:grid-cols-3">
        {/* Profile */}
        <section
          aria-label={profileCopy.title}
          className="flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-pixel-orange"
        >
          <h2 className="font-display text-lg font-bold tracking-tight">
            {profileCopy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{profileCopy.sub}</p>

          {data.profile ? (
            <>
              <dl className="mt-5 space-y-4">
                <ProfileRow
                  label={profileCopy.fields.company}
                  value={data.profile.company}
                />
                <ProfileRow
                  label={profileCopy.fields.industry}
                  value={data.profile.industry}
                />
                <ProfileRow
                  label={profileCopy.fields.stage}
                  value={data.profile.stage}
                />
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {profileCopy.fields.challenges}
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {(data.profile.challenges ?? []).map((challenge) => (
                      <Badge key={challenge} variant="secondary">
                        {challenge}
                      </Badge>
                    ))}
                  </dd>
                </div>
                <ProfileRow
                  label={profileCopy.fields.tools}
                  value={data.profile.tools ?? profileCopy.notSet}
                />
                <ProfileRow
                  label={profileCopy.fields.goal}
                  value={data.profile.goal}
                />
              </dl>
              <Button
                asChild
                variant="outline"
                className="mt-6 h-11 self-start font-semibold"
              >
                <Link href="/onboarding">{profileCopy.edit}</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {profileCopy.empty}
              </p>
              <Button asChild className="mt-6 h-11 self-start font-semibold">
                <Link href="/onboarding">{profileCopy.emptyCta}</Link>
              </Button>
            </>
          )}
        </section>

        {/* Messages */}
        <section
          aria-label={messagesCopy.title}
          className="flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-pixel-orange"
        >
          <h2 className="font-display text-lg font-bold tracking-tight">
            {messagesCopy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {messagesCopy.sub}
          </p>

          {submissions.length > 0 ? (
            <ul className="mt-5 divide-y divide-border">
              {submissions.map((submission) => (
                <li key={submission.id} className="py-4 first:pt-0 last:pb-0">
                  {submission.topic ? (
                    <Badge variant="outline">{submission.topic}</Badge>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed">
                    {truncateMessage(submission.message)}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {messagesCopy.sentLabel} ·{" "}
                    {format(new Date(submission.createdAt), "MMM d, yyyy")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {messagesCopy.empty}
              </p>
              <Button asChild className="mt-6 h-11 self-start font-semibold">
                <Link href="/contact">{messagesCopy.emptyCta}</Link>
              </Button>
            </>
          )}
        </section>

        {/* Next steps */}
        <section
          aria-label={nextCopy.title}
          className="flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-pixel-orange"
        >
          <h2 className="font-display text-lg font-bold tracking-tight">
            {nextCopy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{nextCopy.sub}</p>
          <ol className="mt-5 space-y-4">
            {nextCopy.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-mono text-xs leading-5 text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step}
                </p>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-6 h-11 self-start font-semibold">
            <Link href={nextCopy.cta.href}>{nextCopy.cta.label}</Link>
          </Button>
        </section>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const [data, setData] = useState<MePayload | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;

    async function load(isRetry = false) {
      try {
        const response = await fetch("/api/me");
        if (response.status === 401) {
          if (active) setNeedLogin(true);
          return;
        }
        if (!response.ok) throw new Error("request failed");
        const payload = (await response.json()) as MePayload;
        if (active) {
          setData(payload);
          setFailed(false);
        }
      } catch {
        if (!isRetry) {
          window.setTimeout(() => {
            if (active) void load(true);
          }, 1200);
        } else if (active) {
          setFailed(true);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <SiteShell>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          {status === "loading" ? <SessionSpinner /> : null}

          {status === "unauthenticated" || needLogin ? (
            <NeedLoginCard next="/dashboard" />
          ) : null}

          {status === "authenticated" && !needLogin ? (
            data ? (
              <DashboardBody data={data} />
            ) : failed ? (
              <div className="mt-10 rounded-md border border-destructive/40 bg-destructive/10 p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-destructive">
                  {ERROR_LABEL}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-destructive">
                  {CONTACT.form.error}
                </p>
              </div>
            ) : (
              <>
                <SessionSpinner />
                <SkeletonCards />
              </>
            )
          ) : null}
        </div>
      </main>
    </SiteShell>
  );
}
