import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminRoute, readJson, routeId } from "@/lib/admin/api";
import { recordStaffActivity, recordStaffAudit, recordStaffNotification } from "@/lib/admin/records";
import { INVOICE_STATUSES } from "@/lib/portal/domain";

/**
 * PATCH /api/admin/invoices/[id] (staff only)
 *
 * Records a payment (method + reference, the honest way: money moved
 * outside the portal and the desk writes it down) or re-grades the
 * status (DRAFT, OVERDUE, CANCELLED). A recorded payment stamps
 * paidAt, writes the Payment row and tells the client.
 * 200 { invoice } | 400 | 404
 */

const patchSchema = z.object({
  status: z.enum(INVOICE_STATUSES).optional(),
  payment: z
    .object({
      method: z.enum(["BANK_TRANSFER", "BKASH", "NAGAD", "CARD"]),
      reference: z.string().trim().max(120).default(""),
    })
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await routeId(params);
  return adminRoute(async (context) => {
    const input = await readJson(request, patchSchema);
    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (input.payment) {
      if (invoice.status === "PAID") {
        throw new z.ZodError([
          { code: "custom", path: ["payment"], message: "This invoice is already settled" },
        ]);
      }
      const paidAt = new Date();
      const [updated] = await db.$transaction([
        db.invoice.update({
          where: { id },
          data: {
            status: "PAID",
            paidAt,
            method: input.payment.method,
          },
        }),
        db.payment.create({
          data: {
            invoiceId: id,
            amountCents: invoice.totalCents,
            method: input.payment.method,
            reference: input.payment.reference,
            paidAt,
          },
        }),
      ]);

      await Promise.all([
        recordStaffActivity(context, {
          organizationId: invoice.organizationId,
          type: "BILLING",
          title: `Payment recorded on ${invoice.number}`,
          targetType: "INVOICE",
          targetLabel: invoice.number,
          link: "/workspace/billing",
        }),
        recordStaffNotification(context, {
          organizationId: invoice.organizationId,
          type: "BILLING",
          title: `Payment received for ${invoice.number}`,
          body: "The receipt lives on the billing page. Thank you.",
          link: "/workspace/billing",
        }),
        recordStaffAudit(context, {
          action: "invoice.paid",
          organizationId: invoice.organizationId,
          targetType: "INVOICE",
          targetLabel: invoice.number,
          metadata: { method: input.payment.method, amountCents: invoice.totalCents },
        }),
      ]);

      return NextResponse.json({
        invoice: {
          id: updated.id,
          status: updated.status,
          paidAt: updated.paidAt?.toISOString() ?? null,
          method: updated.method,
        },
      });
    }

    if (!input.status) {
      throw new z.ZodError([
        { code: "custom", path: ["status"], message: "Nothing to update" },
      ]);
    }

    const updated = await db.invoice.update({
      where: { id },
      data: { status: input.status },
    });

    await recordStaffAudit(context, {
      action: "invoice.update",
      organizationId: invoice.organizationId,
      targetType: "INVOICE",
      targetLabel: invoice.number,
      metadata: { status: updated.status },
    });

    return NextResponse.json({
      invoice: {
        id: updated.id,
        status: updated.status,
        paidAt: updated.paidAt?.toISOString() ?? null,
        method: updated.method,
      },
    });
  });
}
