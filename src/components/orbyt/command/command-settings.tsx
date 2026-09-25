"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { COMMAND } from "@/content/command";
import { ROLE_LABELS, TIER_LABELS } from "@/lib/portal/domain";
import type { NotificationPrefs, SettingsPayload } from "@/lib/portal/types";
import { usePortalFetch } from "./use-portal-fetch";
import { ErrorState, LoadingState, PageHeader, Section } from "./primitives";

const PREF_ROWS: { key: keyof NotificationPrefs; labelKey: string; hintKey: string }[] = [
  { key: "approvals", labelKey: "approvals", hintKey: "approvalsHint" },
  { key: "requests", labelKey: "requests", hintKey: "requestsHint" },
  { key: "reports", labelKey: "reports", hintKey: "reportsHint" },
  { key: "billing", labelKey: "billing", hintKey: "billingHint" },
  { key: "systems", labelKey: "systems", hintKey: "systemsHint" },
  { key: "meetings", labelKey: "meetings", hintKey: "meetingsHint" },
];

export function CommandSettings() {
  const { data, loading, failed, refresh, retry } = usePortalFetch<SettingsPayload>("/api/portal/settings");
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changing, setChanging] = useState(false);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { identity } = data;
  const currentPrefs = prefs ?? data.prefs;
  const canWrite = identity.canWrite;
  const notifications = COMMAND.settings.notifications;

  const togglePref = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs({ ...currentPrefs, [key]: value });
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      const response = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPrefs),
      });
      if (response.ok) {
        toast(notifications.saved);
        setPrefs(null);
        refresh();
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast(payload?.error ?? COMMAND.states.errorBody);
      }
    } catch {
      toast(COMMAND.states.errorBody);
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    if (next.length < 8) {
      setPasswordError(security.nextHint);
      return;
    }
    setChanging(true);
    try {
      const response = await fetch("/api/portal/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.ok) {
        toast(COMMAND.settings.security.changed);
        setCurrent("");
        setNext("");
      } else {
        setPasswordError(payload?.error ?? COMMAND.settings.security.wrong);
      }
    } catch {
      setPasswordError(COMMAND.states.errorBody);
    } finally {
      setChanging(false);
    }
  };

  const security = COMMAND.settings.security;

  return (
    <div>
      <PageHeader eyebrow={COMMAND.settings.eyebrow} title={COMMAND.settings.title} sub={COMMAND.settings.sub} />

      <div className="grid min-w-0 gap-10 lg:grid-cols-2">
        {/* Profile */}
        <Section label={COMMAND.settings.profile.label} className="!mt-0">
          <dl className="divide-y divide-border border border-border bg-card/50">
            {[
              { label: COMMAND.settings.profile.name, value: identity.name },
              { label: COMMAND.settings.profile.email, value: identity.email },
              { label: COMMAND.settings.profile.client, value: identity.clientId },
              { label: COMMAND.settings.profile.organization, value: identity.organizationName },
              { label: COMMAND.settings.profile.tier, value: TIER_LABELS[identity.tier] ?? identity.tier },
              { label: COMMAND.settings.profile.role, value: ROLE_LABELS[identity.role] ?? identity.role },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{row.label}</dt>
                <dd className="min-w-0 truncate text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{COMMAND.settings.profile.note}</p>
        </Section>

        <div className="space-y-10">
          {/* Notification preferences */}
          <Section label={notifications.label} sub={notifications.sub} className="!mt-0">
            <div className="divide-y divide-border border border-border bg-card/50">
              {PREF_ROWS.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium">{notifications[row.labelKey as keyof typeof notifications] as string}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {notifications[row.hintKey as keyof typeof notifications] as string}
                    </p>
                  </div>
                  <Switch
                    checked={currentPrefs[row.key]}
                    onCheckedChange={(value) => togglePref(row.key, value)}
                    disabled={!canWrite}
                    aria-label={notifications[row.labelKey as keyof typeof notifications] as string}
                  />
                </div>
              ))}
            </div>
            {canWrite ? (
              <Button
                onClick={() => void savePrefs()}
                disabled={savingPrefs || prefs === null}
                variant="outline"
                className="mt-4"
              >
                {savingPrefs ? notifications.saving : notifications.save}
              </Button>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{COMMAND.settings.viewerNote}</p>
            )}
          </Section>

          {/* Security */}
          <Section label={security.label} className="!mt-0">
            {canWrite ? (
              <div className="space-y-4 border border-border bg-card/50 p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">{security.current}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={current}
                    onChange={(event) => setCurrent(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="next-password">{security.next}</Label>
                  <Input
                    id="next-password"
                    type="password"
                    value={next}
                    onChange={(event) => setNext(event.target.value)}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">{security.nextHint}</p>
                </div>
                {passwordError ? (
                  <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                    {passwordError}
                  </p>
                ) : null}
                <Button onClick={() => void changePassword()} disabled={changing || !current || !next} className="text-[#1B1B1A]">
                  {changing ? security.submitting : security.submit}
                </Button>
              </div>
            ) : (
              <p className="border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {COMMAND.settings.viewerNote}
              </p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
