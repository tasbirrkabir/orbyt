"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { STAFF } from "@/content/admin";
import { useMfaFlow } from "@/components/orbyt/shared/use-mfa-flow";
import { ErrorState, PageHeader } from "@/components/orbyt/command/primitives";
import { AdminPanel, Field, ListLabel } from "./admin-kit";

/**
 * Staff settings room: this seat's own password and two-step
 * verification. Copy comes from STAFF.settings only; the MFA state
 * machine and API calls are shared with the client settings room.
 */

async function sendJson(
  url: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; tokenVersion: number | null; error: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const payload = (await response.json().catch(() => null)) as { tokenVersion?: unknown } | null;
      return {
        ok: true,
        tokenVersion: typeof payload?.tokenVersion === "number" ? payload.tokenVersion : null,
        error: "",
      };
    }
    let message: string = STAFF.states.errorBody;
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === "string" && data.error) message = data.error;
    } catch {
      // No JSON body; the fallback line stands.
    }
    return { ok: false, tokenVersion: null, error: message };
  } catch {
    return { ok: false, tokenVersion: null, error: STAFF.states.errorBody };
  }
}

export function AdminSettings() {
  const password = STAFF.settings.password;
  const { update } = useSession();
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [changing, setChanging] = useState(false);

  const changePassword = async () => {
    if (changing || next.length < 10) return;
    setChanging(true);
    const result = await sendJson("/api/admin/account/password", "POST", { current, next });
    setChanging(false);
    if (result.ok) {
      toast({ title: password.changed });
      setCurrent("");
      setNext("");
      // The server bumped tokenVersion and signed every other session
      // for this seat out. Merge the new version into this session so
      // it survives the change.
      if (result.tokenVersion !== null) {
        await update({ tv: result.tokenVersion });
      }
    } else {
      toast({ title: result.error });
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={STAFF.settings.eyebrow} title={STAFF.settings.title} sub={STAFF.settings.sub} />

      <section aria-label={password.label}>
        <ListLabel>{password.label}</ListLabel>
        <AdminPanel>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void changePassword();
            }}
          >
            <Field id="staff-current-password" label={password.current}>
              <Input
                id="staff-current-password"
                type="password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                autoComplete="current-password"
                aria-label={password.current}
                className="h-11 border-border bg-background"
              />
            </Field>
            <Field id="staff-next-password" label={password.next} hint={password.nextHint}>
              <Input
                id="staff-next-password"
                type="password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                autoComplete="new-password"
                aria-label={password.next}
                className="h-11 border-border bg-background"
              />
            </Field>
            <p className="text-xs leading-relaxed text-muted-foreground">{password.note}</p>
            <Button type="submit" className="h-11" disabled={changing || !current || next.length < 10}>
              {changing ? password.submitting : password.submit}
            </Button>
          </form>
        </AdminPanel>
      </section>

      <AdminMfa />
    </div>
  );
}

/**
 * Two-step verification for the desk seat. Same flow and endpoints as
 * the client panel, STAFF.settings.mfa copy and admin-kit chrome.
 */
function AdminMfa() {
  const mfa = STAFF.settings.mfa;
  const { toast } = useToast();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [copied, setCopied] = useState(false);
  const flow = useMfaFlow({ wrong: mfa.wrong, error: mfa.error });

  if (flow.phase === "loading") {
    return (
      <section aria-label={mfa.label}>
        <ListLabel>{mfa.label}</ListLabel>
        <AdminPanel>
          <div aria-busy="true" className="h-14 w-full animate-pulse bg-muted" />
        </AdminPanel>
      </section>
    );
  }

  if (flow.phase === "failed") {
    return (
      <section aria-label={mfa.label}>
        <ListLabel>{mfa.label}</ListLabel>
        <ErrorState onRetry={flow.retryStatus} />
      </section>
    );
  }

  const on = flow.phase === "on";

  const confirmSetup = async () => {
    const ok = await flow.confirm();
    if (ok) toast({ title: mfa.done });
  };

  const turnOff = async () => {
    const ok = await flow.disable(disablePassword, disableCode.trim());
    if (ok) {
      toast({ title: mfa.off });
      setDisableOpen(false);
      setDisablePassword("");
      setDisableCode("");
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(flow.backupCodes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the codes stay on screen for manual copying.
    }
  };

  return (
    <section aria-label={mfa.label}>
      <ListLabel>{mfa.label}</ListLabel>
      <AdminPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{mfa.label}</p>
          <span
            aria-label={`${mfa.label}: ${on ? mfa.statusOn : mfa.statusOff}`}
            className={
              on
                ? "border border-primary bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#1B1B1A]"
                : "border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            }
          >
            {on ? mfa.statusOn : mfa.statusOff}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{mfa.sub}</p>
        {on ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{mfa.activeOn}</p> : null}
        <Button
          variant={on ? "outline" : "default"}
          className="mt-4 h-11"
          disabled={flow.starting}
          onClick={() => {
            if (on) {
              setDisablePassword("");
              setDisableCode("");
              setDisableOpen(true);
            } else {
              setSetupOpen(true);
              void flow.start();
            }
          }}
        >
          {on ? mfa.disable : mfa.start}
        </Button>
      </AdminPanel>

      {/* Enrollment: scan, confirm the first code, then one-time backup codes. */}
      <Dialog
        open={setupOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSetupOpen(false);
            setCopied(false);
            flow.closeFlow();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(event) => {
            // The backup codes are shown once; an overlay click must not
            // dismiss them. The close button stays deliberate.
            if (flow.step === "backup") event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (flow.step === "backup") event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{mfa.label}</DialogTitle>
            <DialogDescription>{mfa.scan}</DialogDescription>
          </DialogHeader>

          {flow.step === "setup" ? (
            flow.secret ? (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void confirmSetup();
                }}
              >
                <div className="flex justify-center border border-border bg-[#FAF7F2] p-4">
                  <QRCodeSVG value={flow.uri} size={148} bgColor="#FAF7F2" fgColor="#0E0E0D" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {mfa.secretLabel}
                  </p>
                  <p className="break-all border border-border bg-background px-3 py-2 font-mono text-sm">
                    {flow.secret}
                  </p>
                </div>
                <Field id="staff-mfa-setup-code" label={mfa.codeLabel}>
                  <Input
                    id="staff-mfa-setup-code"
                    value={flow.code}
                    onChange={(event) => flow.setCode(event.target.value)}
                    placeholder={mfa.codePlaceholder}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={mfa.codeLabel}
                    className="h-11 border-border bg-background"
                  />
                </Field>
                {flow.error ? (
                  <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                    {flow.error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={flow.confirming || flow.code.trim().length < 6}
                >
                  {flow.confirming ? mfa.confirming : mfa.confirm}
                </Button>
              </form>
            ) : (
              <div aria-busy="true" className="space-y-3">
                <div className="mx-auto h-40 w-40 animate-pulse bg-muted" />
                <div className="h-10 w-full animate-pulse bg-muted" />
                {flow.error ? (
                  <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                    {flow.error}
                  </p>
                ) : null}
              </div>
            )
          ) : null}

          {flow.step === "backup" ? (
            <div className="space-y-4">
              <div>
                <p className="font-display text-base font-semibold">{mfa.backupTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mfa.backupSub}</p>
              </div>
              <ul role="list" className="grid grid-cols-2 gap-2">
                {flow.backupCodes.map((entry) => (
                  <li
                    key={entry}
                    className="border border-border bg-background px-2 py-2 text-center font-mono text-sm tabular-nums"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
              <Button type="button" variant="outline" className="h-11 w-full" onClick={() => void copyCodes()}>
                {copied ? mfa.copied : mfa.copy}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Turning the second factor off always asks for proof again. */}
      <AlertDialog
        open={disableOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDisableOpen(false);
            setDisablePassword("");
            setDisableCode("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{mfa.disableTitle}</AlertDialogTitle>
            <AlertDialogDescription>{mfa.disableBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Field id="staff-mfa-disable-password" label={mfa.disablePassword}>
              <Input
                id="staff-mfa-disable-password"
                type="password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
                autoComplete="current-password"
                aria-label={mfa.disablePassword}
                className="h-11 border-border bg-background"
              />
            </Field>
            <Field id="staff-mfa-disable-code" label={mfa.disableCode}>
              <Input
                id="staff-mfa-disable-code"
                value={disableCode}
                onChange={(event) => setDisableCode(event.target.value)}
                placeholder={mfa.codePlaceholder}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={mfa.disableCode}
                className="h-11 border-border bg-background"
              />
            </Field>
            {flow.error ? (
              <p role="status" className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                {flow.error}
              </p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-11"
              disabled={flow.disabling || !disablePassword || disableCode.trim().length < 6}
              onClick={(event) => {
                event.preventDefault();
                void turnOff();
              }}
            >
              {flow.disabling ? mfa.disabling : mfa.disableConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
