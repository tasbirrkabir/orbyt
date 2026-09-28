"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConsoleSection, CopyChip, fmtDate, staffFetch, type StaffError } from "./admin-bits";

/**
 * Provision tab: create a tenant directly, for engagements that do
 * not start from a website lead. One form, one keyed call, and the
 * response carries the only plaintext activation link that will ever
 * exist outside the invite email.
 */

type ProvisionResult = {
  ok: true;
  organizationId: string;
  clientId: string;
  ownerUserId: string;
  projectId: string | null;
  activationUrl: string;
  inviteExpiresAt: string;
};

const TIERS = [
  { value: "WEBSITE_ONLY", label: "Website only" },
  { value: "MARKETING_WEBSITE", label: "Website + marketing" },
  { value: "FULL_SERVICE", label: "Full service" },
];

const PROJECT_TYPES = [
  { value: "WEBSITE", label: "Website" },
  { value: "MARKETING", label: "Marketing" },
  { value: "AUTOMATION", label: "Automation" },
  { value: "AI", label: "AI" },
  { value: "FULL_SERVICE", label: "Full service" },
];

export function ProvisionTab({ apiKey }: { apiKey: string }) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [tier, setTier] = useState("WEBSITE_ONLY");
  const [country, setCountry] = useState("BD");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState("WEBSITE");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim());
  const canSubmit = companyName.trim().length >= 2 && ownerName.trim().length >= 2 && emailOk && !busy;

  async function submit() {
    setBusy(true);
    try {
      const response = await staffFetch<ProvisionResult>(apiKey, "/api/lifecycle/provision", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          tier,
          country: country.trim() || undefined,
          projectTitle: projectTitle.trim() || undefined,
          projectType: projectTitle.trim() ? projectType : undefined,
        }),
      });
      setResult(response);
      toast({ title: `${response.clientId} provisioned` });
      setCompanyName("");
      setOwnerName("");
      setOwnerEmail("");
      setProjectTitle("");
    } catch (caught) {
      const error = caught as StaffError;
      toast({
        title: error.status === 409 ? "That email is already in use" : "Provisioning failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ConsoleSection
        title="Provision a new tenant"
        description="Creates the organization, the owner account (unactivated until they set a password), an optional first project, the welcome activity and a single-use invite. The invite email is sent automatically; copy the client ID, support needs it."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pv-company" className="text-xs text-stone-500">Company name</Label>
            <Input id="pv-company" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Acme Roasters Ltd" className="mt-1 bg-white" />
          </div>
          <div>
            <Label htmlFor="pv-tier" className="text-xs text-stone-500">Service tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger id="pv-tier" className="mt-1 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pv-name" className="text-xs text-stone-500">Owner name</Label>
            <Input id="pv-name" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Rahim Uddin" className="mt-1 bg-white" />
          </div>
          <div>
            <Label htmlFor="pv-email" className="text-xs text-stone-500">Owner email</Label>
            <Input id="pv-email" type="email" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} placeholder="owner@company.com" className="mt-1 bg-white" />
            {ownerEmail && !emailOk ? <p className="mt-1 text-xs text-red-700">That does not look like an email address.</p> : null}
          </div>
          <div>
            <Label htmlFor="pv-country" className="text-xs text-stone-500">Country code</Label>
            <Input id="pv-country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="BD" className="mt-1 bg-white" />
          </div>
        </div>

        <div className="mt-4 border-t border-stone-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">First project (optional)</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pv-project" className="text-xs text-stone-500">Project title</Label>
              <Input id="pv-project" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="Storefront rebuild" className="mt-1 bg-white" />
            </div>
            <div>
              <Label htmlFor="pv-ptype" className="text-xs text-stone-500">Project type</Label>
              <Select value={projectType} onValueChange={setProjectType} disabled={!projectTitle.trim()}>
                <SelectTrigger id="pv-ptype" className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button className="mt-5" disabled={!canSubmit} onClick={() => void submit()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Provision tenant
        </Button>
      </ConsoleSection>

      {result ? (
        <ConsoleSection title="Tenant ready" description="Share the credentials by your usual secure channel. The activation link is single use and expires in 7 days; after that, issue a fresh invite.">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-500">Client ID</p>
                <div className="mt-1"><CopyChip value={result.clientId} /></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-stone-500">Activation link</p>
                <div className="mt-1"><CopyChip value={result.activationUrl} label={result.activationUrl.replace(/^https?:\/\//, "")} /></div>
              </div>
            </div>
            <p className="text-xs text-stone-500">
              Invite expires {fmtDate(result.inviteExpiresAt)} · owner: {ownerEmail || "see form"} · first project: {result.projectId ? "created" : "none"}
            </p>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>Clear</Button>
          </div>
        </ConsoleSection>
      ) : null}
    </div>
  );
}
