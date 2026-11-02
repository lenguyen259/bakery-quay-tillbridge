import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/session";
import { getMessages } from "@/i18n";
import { formatVnd } from "@/lib/format";
import { ensureRecCases } from "@/server/reconcile";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getMessages();
  let openInvoiceTotal = 0;
  let openCases = 0;
  let oldestBreak = 0;
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: "issued" },
    });
    openInvoiceTotal = invoices.reduce((s, i) => s + i.total_vnd, 0);
    await ensureRecCases();
    openCases = await prisma.recCase.count({
      where: { status: { in: ["proposed", "ambiguous"] } },
    });
    const shift = await prisma.posShift.findFirst({
      where: { break_vnd: { not: 0 } },
      orderBy: { business_date: "asc" },
    });
    oldestBreak = shift?.break_vnd ?? 0;
  } catch {
    /* db offline */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">{t.homeTitle}</h1>
        <p className="text-cocoa/80">{t.homeSubtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label={locale === "vi" ? "Tổng hóa đơn mở" : "Open invoice total"}
          value={formatVnd(openInvoiceTotal, locale)}
        />
        <Stat
          label={locale === "vi" ? "Case đối soát mở" : "Open reconcile cases"}
          value={String(openCases)}
        />
        <Stat
          label={locale === "vi" ? "Chênh lệch ca cũ nhất" : "Oldest shift break"}
          value={formatVnd(oldestBreak, locale)}
          tone="exception"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "exception";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${tone === "exception" ? "border-clay bg-clay/10" : "border-cocoa/20 bg-paper"}`}
    >
      <p className="text-sm text-cocoa/70">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
