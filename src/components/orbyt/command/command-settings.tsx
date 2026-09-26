"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

type MfaDialogMode = "setup" | "disable" | "codes";

async function readError(response: Response): Promise<string | null> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? null;
}

export function CommandSettings() {
  const { data, loading, failed, refresh, retry } = usePortalFetch<SettingsPayload>("/api/portal/settings");
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changing, setChanging] = useState(false);
  const [mfaDialog, setMfaDialog] = useState<MfaDialogMode | null>(null);

  if (loading && !data) return <LoadingState />;
  if (failed && !data) return <ErrorState onRetry={retry} />;
  if (!data) return null;

  const { identity, security } = data;
  const currentPrefs = prefs ?? data.prefs;
  const canWrite = identity.canWrite;
  const notifications = COMMAND.settings.notifications;
  const s = COMMAND.settings.security;

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
        toast((await readError(response)) ?? COMMAND.states.errorBody);
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
      setPasswordError(s.nextHint);
      return;
    }
    setChanging(true);
    try {
      const response = await fetch("/api/portal/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      if (response.ok) {
        toast(s.changed);
        // The change ended every session (token version). End this one
        // too: the shell flips back to the sign-in gate in place.
        await signOut({ redirect: false });
      } else {
        setPasswordError((await readError(response)) ?? s.wrong);
      }
    } catch {
      setPasswordError(COMMAND.states.errorBody);
    } finally {
      setChanging(false);
    }
  };

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

          {/* Security: two-step verification + password */}
          <Section label={s.label} className="!mt-0">
            {canWrite ? (
              <div className="space-y-4">
                <MfaBlock
                  security={security}
                  onOpen={(mode) => setMfaDialog(mode)}
                />
                <div className="space-y-4 border border-border bg-card/50 p-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="current-password">{s.current}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={current}
                      onChange={(event) => setCurrent(event.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="next-password">{s.next}</Label>
                    <Input
                      id="next-password"
                      type="password"
                      value={next}
                      onChange={(event) => setNext(event.target.value)}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-muted-foreground">{s.nextHint}</p>
                  </div>
                  {passwordError ? (
                    <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                      {passwordError}
                    </p>
                  ) : null}
                  <Button onClick={() => void changePassword()} disabled={changing || !current || !next} className="text-[#1B1B1A]">
                    {changing ? s.submitting : s.submit}
                  </Button>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                </div>
              </div>
            ) : (
              <p className="border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {COMMAND.settings.viewerNote}
              </p>
            )}
          </Section>
        </div>
      </div>

      <MfaDialogs
        mode={mfaDialog}
        onClose={() => setMfaDialog(null)}
        onChanged={() => {
          refresh();
        }}
        onDisabled={async () => {
          refresh();
          toast(s.mfaOffSaved);
          await signOut({ redirect: false });
        }}
      />
    </div>
  );
}

// ── Two-step verification block ──────────────────────────────────

function MfaBlock({
  security,
  onOpen,
}: {
  security: SettingsPayload["security"];
  onOpen: (mode: MfaDialogMode) => void;
}) {
  const s = COMMAND.settings.security;

  return (
    <div className="border border-border bg-card/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className={security.mfaEnabled ? "size-4 text-primary" : "size-4 text-muted-foreground"} />
            <p className="text-sm font-semibold">{s.mfaLabel}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {security.mfaEnabled ? s.mfaOnNote : s.mfaOffNote}
          </p>
        </div>
        <span
          className={`shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
            security.mfaEnabled
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {security.mfaEnabled ? s.mfaOn : s.mfaOff}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {security.mfaEnabled ? (
          <>
            <Button variant="outline" size="sm" onClick={() => onOpen("codes")}>
              {s.mfaNewCodes}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpen("disable")}>
              {s.mfaTurnOff}
            </Button>
          </>
        ) : security.canManageMfa ? (
          <Button size="sm" className="text-[#1B1B1A]" onClick={() => onOpen("setup")}>
            {s.mfaTurnOn}
          </Button>
        ) : null}
      </div>
      {!security.canManageMfa && !security.mfaEnabled ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{s.mfaDemoNote}</p>
      ) : null}
    </div>
  );
}

// ── MFA dialogs: setup, disable, backup codes ────────────────────

type SetupResponse = { secret: string; otpauth: string; qr: string };
type CodesResponse = { backupCodes: string[] };

function BackupCodesView({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const s = COMMAND.settings.security;
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (permissions): the codes stay visible.
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold">{s.mfaCodesTitle}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.mfaCodesSub}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 border border-border bg-blueprint p-4">
        {codes.map((code) => (
          <li key={code} className="font-mono text-sm tracking-wider">
            {code}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => void copyAll()}>
          <Copy aria-hidden="true" className="size-4" />
          {copied ? s.mfaCopied : s.mfaCopyAll}
        </Button>
        <Button size="sm" className="text-[#1B1B1A]" onClick={onDone}>
          {s.mfaCodesDone}
        </Button>
      </div>
    </div>
  );
}

function MfaDialogs({
  mode,
  onClose,
  onChanged,
  onDisabled,
}: {
  mode: MfaDialogMode | null;
  onClose: () => void;
  onChanged: () => void;
  onDisabled: () => void | Promise<void>;
}) {
  const s = COMMAND.settings.security;
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setSetup(null);
    setCodes(null);
    setCode("");
    setPassword("");
    setError("");
    setPending(false);
    onClose();
  };

  const startSetup = async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/setup", { method: "POST" });
      if (!response.ok) {
        setError((await readError(response)) ?? s.mfaError);
        return;
      }
      setSetup((await response.json()) as SetupResponse);
    } catch {
      setError(s.mfaError);
    } finally {
      setPending(false);
    }
  };

  const verifySetup = async () => {
    if (pending) return;
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError(s.mfaCodeLabel);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      if (!response.ok) {
        setError((await readError(response)) ?? s.mfaError);
        return;
      }
      const payload = (await response.json()) as CodesResponse;
      setCodes(payload.backupCodes);
      onChanged();
    } catch {
      setError(s.mfaError);
    } finally {
      setPending(false);
    }
  };

  const disable = async () => {
    if (pending) return;
    if (!password) {
      setError(s.mfaPasswordLabel);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError((await readError(response)) ?? s.mfaError);
        return;
      }
      await onDisabled();
      reset();
    } catch {
      setError(s.mfaError);
      setPending(false);
    }
  };

  const regenerate = async () => {
    if (pending) return;
    if (!password) {
      setError(s.mfaPasswordLabel);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError((await readError(response)) ?? s.mfaError);
        return;
      }
      const payload = (await response.json()) as CodesResponse;
      setCodes(payload.backupCodes);
    } catch {
      setError(s.mfaError);
    } finally {
      setPending(false);
    }
  };

  const open = mode !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : reset())}>
      <DialogContent className="max-w-md border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">
            {mode === "setup" ? s.mfaSetupTitle : mode === "disable" ? s.mfaDisableTitle : s.mfaRegenerateTitle}
          </DialogTitle>
        </DialogHeader>

        {mode === "setup" ? (
          codes ? (
            <BackupCodesView codes={codes} onDone={reset} />
          ) : setup ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {/* The QR is a data URL from our own API: no remote image. */}
                <img
                  src={setup.qr}
                  alt="QR code for your authenticator app"
                  className="h-56 w-56 rounded-sm border border-border bg-blueprint"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">{s.mfaStepScanSub}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfa-secret">{s.mfaSecretLabel}</Label>
                <Input
                  id="mfa-secret"
                  readOnly
                  value={setup.secret}
                  className="font-mono text-xs tracking-widest"
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mfa-code">{s.mfaCodeLabel}</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setError("");
                  }}
                  className="h-12 font-mono tracking-[0.4em]"
                />
              </div>
              {error ? (
                <p role="alert" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}
              <Button
                onClick={() => void verifySetup()}
                disabled={pending || code.trim().length < 6}
                className="w-full text-[#1B1B1A]"
              >
                {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {pending ? s.mfaVerifying : s.mfaVerify}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{s.mfaStepScan}</p>
              {error ? (
                <p role="alert" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}
              <Button
                onClick={() => void startSetup()}
                disabled={pending}
                className="w-full text-[#1B1B1A]"
              >
                {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {pending ? s.mfaVerifying : s.mfaTurnOn}
              </Button>
            </div>
          )
        ) : null}

        {mode === "disable" || mode === "codes" ? (
          codes ? (
            <BackupCodesView
              codes={codes}
              onDone={() => {
                setCodes(null);
                reset();
              }}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {mode === "disable" ? s.mfaDisableSub : s.mfaRegenerateSub}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="mfa-password">{s.mfaPasswordLabel}</Label>
                <Input
                  id="mfa-password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
              </div>
              {error ? (
                <p role="alert" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  {error}
                </p>
              ) : null}
              {mode === "disable" ? (
                <Button
                  variant="destructive"
                  onClick={() => void disable()}
                  disabled={pending || !password}
                  className="w-full"
                >
                  {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                  {pending ? s.mfaVerifying : s.mfaDisableConfirm}
                </Button>
              ) : (
                <Button
                  onClick={() => void regenerate()}
                  disabled={pending || !password}
                  className="w-full text-[#1B1B1A]"
                >
                  {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                  {pending ? s.mfaVerifying : s.mfaRegenerateConfirm}
                </Button>
              )}
            </div>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
