"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STAFF_KEY_STORE, staffFetch, type StaffError } from "./admin-bits";
import { OverviewTab } from "./overview-tab";
import { LeadsTab } from "./leads-tab";
import { TenantsTab } from "./tenants-tab";
import { ProjectsTab } from "./projects-tab";
import { ProvisionTab } from "./provision-tab";

/**
 * ORBYT staff console.
 *
 * The credential is the shared staff bearer key (PROVISION_API_KEY in
 * the server environment). It is pasted once per browser session,
 * kept in sessionStorage, and attached to every call to the keyed
 * internal endpoints. It never touches a cookie, a log line, or any
 * third party; locking the console drops it from the browser.
 *
 * Every action the console performs is audited server side, which is
 * why the overview tab can show the audit trail as a matter of fact.
 */

export function StaffConsole() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [draftKey, setDraftKey] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [tab, setTab] = useState("overview");
  const [focusProjectId, setFocusProjectId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const verify = useCallback(async (candidate: string): Promise<boolean> => {
    try {
      await staffFetch(candidate, "/api/lifecycle/leads?limit=1");
      sessionStorage.setItem(STAFF_KEY_STORE, candidate);
      setApiKey(candidate);
      setGateError(null);
      return true;
    } catch (caught) {
      const error = caught as StaffError;
      if (error.status === 503) {
        setGateError("This deployment has no staff key configured. Set PROVISION_API_KEY on the server first.");
      } else if (error.status === 429) {
        setGateError("Too many attempts. Wait a few minutes before trying again.");
      } else {
        setGateError("That key is not valid for this deployment.");
      }
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const stored = sessionStorage.getItem(STAFF_KEY_STORE);
    void (async () => {
      // sessionStorage and the guard check are browser-only work; the
      // state updates all happen after this await, never mid-render.
      await Promise.resolve();
      if (stored) await verify(stored);
      if (active) setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [verify]);

  function lock() {
    sessionStorage.removeItem(STAFF_KEY_STORE);
    setApiKey(null);
    setDraftKey("");
    setTab("overview");
    setFocusProjectId(null);
  }

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    if (!draftKey.trim() || verifying) return;
    setVerifying(true);
    setGateError(null);
    const ok = await verify(draftKey.trim());
    if (ok) setDraftKey("");
    setVerifying(false);
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Opening the console
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-stone-900">ORBYT staff console</h1>
              <p className="text-xs text-stone-500">Operations for the crew, audited on every action.</p>
            </div>
          </div>
          <form onSubmit={(event) => void unlock(event)} className="space-y-4">
            <div>
              <Label htmlFor="staff-key" className="text-xs text-stone-500">Staff key</Label>
              <Input
                id="staff-key"
                ref={inputRef}
                type="password"
                autoComplete="off"
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                placeholder="Paste the deployment's staff key"
                className="mt-1 bg-white font-mono"
                autoFocus
              />
            </div>
            {gateError ? <p className="text-sm text-red-700">{gateError}</p> : null}
            <Button type="submit" className="w-full" disabled={!draftKey.trim() || verifying}>
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Unlock console
            </Button>
          </form>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            The key lives in the server environment (PROVISION_API_KEY) and is compared in constant time.
            This console keeps it in this browser tab only, and every call is throttled and recorded in the audit ledger.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">ORBYT staff console</p>
              <p className="text-xs text-stone-500">Key held in this session only</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={lock}>
            <Lock className="h-3.5 w-3.5" /> Lock
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 flex w-full justify-start gap-1 overflow-x-auto bg-stone-200/60 sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="provision">Provision</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab
              apiKey={apiKey}
              onOpenProject={(projectId) => {
                setFocusProjectId(projectId);
                setTab("projects");
              }}
            />
          </TabsContent>
          <TabsContent value="tenants">
            <TenantsTab
              apiKey={apiKey}
              onOpenProject={(projectId) => {
                setFocusProjectId(projectId);
                setTab("projects");
              }}
            />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsTab apiKey={apiKey} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsTab apiKey={apiKey} focusProjectId={focusProjectId} />
          </TabsContent>
          <TabsContent value="provision">
            <ProvisionTab apiKey={apiKey} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-stone-500">
            ORBYT internal surface · staff key required · every action lands in the audit ledger
          </p>
        </div>
      </footer>
    </div>
  );
}
