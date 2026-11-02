import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canMutateInvoice } from "@/server/policy";
import { writeAudit } from "@/server/reconcile";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const role = await getDemoRole();
  if (!canMutateInvoice(role)) {
    return jsonError("FORBIDDEN", "Finance only", "Chỉ finance", 403);
  }
  const { id } = await ctx.params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return jsonError("NOT_FOUND", "Invoice not found", "Không có hóa đơn", 404);
  }
  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: "void" },
  });
  await writeAudit(role, "invoice.void", "invoice", id, { number: invoice.number });
  return jsonOk(updated);
}
