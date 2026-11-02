import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { narrateInvoiceSo200 } from "@/lib/ai/client";
import { getDemoRole } from "@/lib/session";
import { canMutateInvoice } from "@/server/policy";
import { invoiceTotalsFromLines } from "@/server/vat";

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
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: { lines: { include: { item: true } }, customer: true },
  });
  if (!order) {
    return jsonError("NOT_FOUND", "Order not found", "Không có đơn", 404);
  }
  const existing = await prisma.invoice.findFirst({ where: { order_id: id } });
  if (existing) {
    return jsonOk(existing);
  }

  const vatBps = order.lines[0]?.item.vat_rate_bps ?? 800;
  const totals = invoiceTotalsFromLines(
    order.lines.map((l) => ({ qty: l.qty, unit_price_vnd: l.unit_price_vnd })),
    vatBps,
  );

  const seq = await prisma.invoice.count();
  const number = `HĐ-${2000 + seq}`;
  const narration =
    id === "so-200" ? await narrateInvoiceSo200() : { narration_en: "", narration_vi: "", mode: "demo" as const, flags: [] };

  const invoice = await prisma.invoice.create({
    data: {
      id: `inv-draft-${id}`,
      order_id: id,
      number,
      status: "draft",
      subtotal_vnd: totals.subtotal_vnd,
      vat_vnd: totals.vat_vnd,
      total_vnd: totals.total_vnd,
      narration_en: narration.narration_en,
      narration_vi: narration.narration_vi,
      narration_mode: narration.mode,
      lines: {
        create: order.lines.map((l, i) => ({
          id: `il-${id}-${i}`,
          sku: l.sku,
          qty: l.qty,
          unit_price_vnd: l.unit_price_vnd,
          line_subtotal_vnd: l.qty * l.unit_price_vnd,
        })),
      },
    },
  });

  return jsonOk({ ...invoice, calculated: totals, flags: narration.flags });
}
