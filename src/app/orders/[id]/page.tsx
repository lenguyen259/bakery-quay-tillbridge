import { prisma } from "@/lib/db";
import { getDemoRole } from "@/lib/session";
import { canMutateInvoice } from "@/server/policy";
import { getMessages } from "@/i18n";
import { formatVnd } from "@/lib/format";
import { getLocale } from "@/lib/session";
import { DraftInvoiceButton } from "@/components/ClientActions";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getDemoRole();
  const locale = await getLocale();
  const t = await getMessages();
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: { lines: { include: { item: true } }, customer: true, invoices: true },
  });
  if (!order) return <p>Not found</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">{order.id}</h1>
      <p>{order.customer.name}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cocoa/20 text-left">
            <th>SKU</th>
            <th>Qty</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => (
            <tr key={l.id} className="border-b border-cocoa/10">
              <td>{l.sku}</td>
              <td>{l.qty}</td>
              <td>{formatVnd(l.unit_price_vnd, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {canMutateInvoice(role) && !order.invoices.length && (
        <DraftInvoiceButton orderId={order.id} />
      )}
      {order.invoices.map((inv) => (
        <div key={inv.id} className="rounded border border-cocoa/20 p-4 text-sm">
          <p>
            {inv.number} — {inv.status}
          </p>
          <p>
            {t.calculated}: {formatVnd(inv.subtotal_vnd, locale)} + VAT{" "}
            {formatVnd(inv.vat_vnd, locale)} = {formatVnd(inv.total_vnd, locale)}
          </p>
          <p className="mt-2 text-cocoa/80">{inv.narration_vi ?? inv.narration_en}</p>
        </div>
      ))}
    </div>
  );
}
