import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/format";
import { getLocale } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const locale = await getLocale();
  const invoices = await prisma.invoice.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Invoices</h1>
      <ul className="divide-y divide-cocoa/10 rounded-xl border border-cocoa/20">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {inv.number} <span className="text-cocoa/60">({inv.status})</span>
            </span>
            <span>{formatVnd(inv.total_vnd, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
