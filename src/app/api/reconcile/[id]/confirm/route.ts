import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canConfirmReconcile } from "@/server/policy";
import { writeAudit } from "@/server/reconcile";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const role = await getDemoRole();
  if (!canConfirmReconcile(role)) {
    return jsonError("FORBIDDEN", "Finance only", "Chỉ finance", 403);
  }
  const { id } = await ctx.params;
  const body = await readJsonBody<{ chosenInvoiceId?: string }>(req);
  const rec = await prisma.recCase.findUnique({ where: { id } });
  if (!rec) {
    return jsonError("NOT_FOUND", "Case not found", "Không có case", 404);
  }
  if (rec.needs_choice && !body?.chosenInvoiceId) {
    return jsonError(
      "CHOICE_REQUIRED",
      "Choose an invoice",
      "Phải chọn hóa đơn",
      409,
    );
  }
  const invoiceId = body?.chosenInvoiceId ?? rec.invoice_id;
  if (!invoiceId) {
    return jsonError(
      "CHOICE_REQUIRED",
      "Choose an invoice",
      "Phải chọn hóa đơn",
      409,
    );
  }
  const updated = await prisma.recCase.update({
    where: { id },
    data: { status: "confirmed", invoice_id: invoiceId, needs_choice: false },
  });
  await writeAudit(role, "reconcile.confirm", "rec_case", id, {
    chosenInvoiceId: invoiceId,
  });
  return jsonOk(updated);
}
