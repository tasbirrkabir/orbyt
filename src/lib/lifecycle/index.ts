import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { generateClientId } from "@/lib/client-id";
import { sendInviteEmail } from "@/lib/email";
import { log } from "@/lib/observability";

/**
 * The ORBYT client lifecycle: LEAD -> CLIENT -> ORGANIZATION -> CLIENT ID
 * -> ONBOARDING -> PROJECT.
 *
 * Before this module the platform could not create a tenant: client IDs
 * existed (generated for demo accounts and the legacy bridge) but the
 * generation service was never called for a real engagement. Provisioning
 * happened by hand in the database.
 *
 * This service is the single door for turning a lead into a live tenant:
 *   - provisionTenant: creates the organization, its owner account, the
 *     optional first project, the welcome activity, and a single-use
 *     hashed invitation token, then emails the activation link.
 *   - convertLead: the same, starting from a ContactSubmission row,
 *     marking the lead CONVERTED inside the same transaction.
 *   - setLeadStatus: the lighter lead stages (CONTACTED, QUALIFIED, ARCHIVED).
 *
 * Integrity rules:
 *   - The whole provision happens in one transaction; a partial tenant
 *     cannot exist.
 *   - Client IDs are generated with the unambiguous ORB-XXXXXX alphabet
 *     and checked against both Organization and User before use.
 *   - The activation token reuses the reset-token machinery (SHA-256 at
 *     rest, single-use) with kind INVITE and a 7 day expiry.
 *   - Demo tenants are seeded by the demo seeder and are never touched
 *     here: provisioning only creates new rows, it never mutates existing
 *     organizations.
 */

export const INVITE_TTL_DAYS = 7;

const TIERS = new Set(["WEBSITE_ONLY", "MARKETING_WEBSITE", "FULL_SERVICE"]);

export type LifecycleError = Error & { status?: number };

function lifecycleError(message: string, status: number): LifecycleError {
  const error = new Error(message) as LifecycleError;
  error.status = status;
  return error;
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Fresh ORB-XXXXXX that is unique across organizations AND users. */
export async function generateUniqueClientId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateClientId();
    const [orgTaken, userTaken] = await Promise.all([
      db.organization.findUnique({ where: { clientId: candidate }, select: { id: true } }),
      db.user.findUnique({ where: { clientId: candidate }, select: { id: true } }),
    ]);
    if (!orgTaken && !userTaken) return candidate;
  }
  throw lifecycleError("Could not allocate a unique client ID", 500);
}

export type ProvisionInput = {
  companyName: string;
  ownerEmail: string;
  ownerName: string;
  tier: string;
  country?: string;
  projectTitle?: string;
  projectType?: string;
  /** When set, the lead row is marked CONVERTED in the same transaction. */
  leadId?: string;
};

export type ProvisionResult = {
  organizationId: string;
  clientId: string;
  ownerUserId: string;
  projectId: string | null;
  /** The one-time activation link. The email carries the same link. */
  activationUrl: string;
  inviteExpiresAt: Date;
};

/**
 * Create a tenant end to end. Throws LifecycleError with a status the
 * API funnel passes through. The activation link is returned to the
 * (staff-keyed) caller AND emailed; the raw token is never stored.
 */
export async function provisionTenant(input: ProvisionInput): Promise<ProvisionResult> {
  const companyName = input.companyName.trim();
  const ownerEmail = input.ownerEmail.trim().toLowerCase();
  const ownerName = input.ownerName.trim();
  const tier = input.tier.trim().toUpperCase();

  if (companyName.length < 2) throw lifecycleError("companyName is required", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    throw lifecycleError("ownerEmail is not a valid address", 400);
  }
  if (ownerName.length < 2) throw lifecycleError("ownerName is required", 400);
  if (!TIERS.has(tier)) throw lifecycleError("Unknown tier", 400);

  // An owner email can only own one account.
  const existingUser = await db.user.findUnique({
    where: { email: ownerEmail },
    select: { id: true, organizationId: true },
  });
  if (existingUser) {
    throw lifecycleError("An account with this email already exists", 409);
  }

  const clientId = await generateUniqueClientId();
  const inviteRaw = randomBytes(32).toString("base64url");
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const result = await db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: companyName,
        clientId,
        tier,
        country: input.country?.trim() || "BD",
      },
      select: { id: true },
    });

    const owner = await tx.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        organizationId: organization.id,
        role: "CLIENT_OWNER",
        clientId, // the owner logs in with the org's client ID
        // passwordHash stays null: the account is INACTIVE until the
        // invite link is used to set a password.
      },
      select: { id: true },
    });

    let projectId: string | null = null;
    if (input.projectTitle && input.projectTitle.trim().length >= 2) {
      const project = await tx.project.create({
        data: {
          userId: owner.id,
          organizationId: organization.id,
          title: input.projectTitle.trim(),
          code: "PRJ-001",
          type: input.projectType?.trim() || "WEBSITE",
          status: "PLANNING",
          stage: "DISCOVER",
        },
        select: { id: true },
      });
      projectId = project.id;
    }

    // The first entry in the client's own activity ledger: a recorded
    // fact (this provision happened), visible the moment they log in.
    await tx.activityEvent.create({
      data: {
        organizationId: organization.id,
        type: "PROJECT",
        title: "Your ORBYT workspace is ready",
        actorName: "ORBYT",
        actorRole: "ORBYT",
        targetType: "ORGANIZATION",
        targetLabel: companyName,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        userId: owner.id,
        tokenHash: hashToken(inviteRaw),
        kind: "INVITE",
        expiresAt: inviteExpiresAt,
      },
    });

    if (input.leadId) {
      const lead = await tx.contactSubmission.findUnique({
        where: { id: input.leadId },
        select: { id: true, status: true },
      });
      if (!lead) throw lifecycleError("Lead not found", 404);
      if (lead.status === "CONVERTED") {
        throw lifecycleError("Lead is already converted", 409);
      }
      await tx.contactSubmission.update({
        where: { id: input.leadId },
        data: { status: "CONVERTED", convertedOrganizationId: organization.id },
      });
    }

    return { organizationId: organization.id, clientId, ownerUserId: owner.id, projectId };
  });

  // After the transaction: the invite email and the audit entries are
  // fire-and-forget; provisioning itself already succeeded and is a
  // stored fact.
  const base = appBase();
  const activationUrl = `${base}/login/activate?token=${inviteRaw}`;
  sendInviteEmail({
    to: ownerEmail,
    ownerName,
    companyName,
    clientId,
    activationUrl,
    expiresDays: INVITE_TTL_DAYS,
  });

  log.info("lifecycle", "tenant provisioned", {
    org: result.organizationId,
    client: result.clientId,
    lead: input.leadId ?? "",
    project: result.projectId ?? "",
  });

  return {
    organizationId: result.organizationId,
    clientId: result.clientId,
    ownerUserId: result.ownerUserId,
    projectId: result.projectId,
    activationUrl,
    inviteExpiresAt,
  };
}

const CONVERTIBLE = new Set(["NEW", "CONTACTED", "QUALIFIED"]);

/** Convert a ContactSubmission lead into a tenant. */
export async function convertLead(
  leadId: string,
  input: Omit<ProvisionInput, "leadId">,
): Promise<ProvisionResult> {
  const lead = await db.contactSubmission.findUnique({
    where: { id: leadId },
    select: { id: true, status: true, name: true, email: true, topic: true },
  });
  if (!lead) throw lifecycleError("Lead not found", 404);
  if (!CONVERTIBLE.has(lead.status)) {
    throw lifecycleError(`Lead status ${lead.status} cannot be converted`, 409);
  }
  return provisionTenant({
    ...input,
    ownerEmail: input.ownerEmail || lead.email,
    ownerName: input.ownerName || lead.name,
    companyName: input.companyName || lead.topic || lead.name,
    leadId,
  });
}

const LEAD_STATUSES = new Set(["NEW", "CONTACTED", "QUALIFIED", "ARCHIVED"]);

/** Move a lead between the light lifecycle states (never to CONVERTED; use convertLead). */
export async function setLeadStatus(leadId: string, status: string): Promise<void> {
  if (!LEAD_STATUSES.has(status)) throw lifecycleError("Unknown lead status", 400);
  const lead = await db.contactSubmission.findUnique({
    where: { id: leadId },
    select: { id: true, status: true },
  });
  if (!lead) throw lifecycleError("Lead not found", 404);
  if (lead.status === "CONVERTED") {
    throw lifecycleError("A converted lead is closed and cannot change", 409);
  }
  await db.contactSubmission.update({ where: { id: leadId }, data: { status } });
}

function appBase(): string {
  const url =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
