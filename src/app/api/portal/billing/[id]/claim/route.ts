import { NextResponse } from "next/server";
import { z } from "zod";
import { portalRoute, readJson, routeId } from "@/lib/portal/api";
import { recordActivity, recordAudit } from "@/lib/portal/records";
import { recordPaymentClaim, StaffOpsError } from "@/lib/staff-ops";

/**
 * POST /api/portal/billing/[id]/claim (protected, writers only)
 *
 * The client reports they have sent a payment. This is a claim, not a
 * confirmation: a Payment row records who said what, when, by which
 * method — and the invoice stays PENDING until ORBYT confirms receipt
 * from the staff console. The portal never marks its own money as
 * received.
 *
 * Contract: 201 { ok } | 400 | 401 | 403 | 404 | 409 | 500.
 */

const claimSchema = z.object({
  method: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"]),
  reference: z.string().trim().max(120).default(""),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return portalRoute(async (context) => {
    const invoiceId = await routeId(params);
    const input = await readJson(request, claimSchema);

    try {
      await recordPaymentClaim(invoiceId, input.method, input.reference);
    } catch (error) {
      if (error instanceof StaffOpsError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

    await Promise.all([
      recordActivity(context, {
        type: "BILLING",
        title: "You reported a payment — ORBYT will confirm receipt",
        actorRole: "CLIENT",
        targetType: "INVOICE",
        targetLabel: invoiceId,
        link: "/workspace/billing",
      }),
      recordAudit(context, {
        action: "billing.paymentClaim",
        targetType: "INVOICE",
        targetLabel: invoiceId,
        metadata: { method: input.method },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 201 });
  }, { write: true });
}
