import { prisma } from "@/lib/db";
import { getDemoRole } from "@/lib/session";
import { canReadBankQueue, canReadReconcileSummary } from "@/server/policy";
import { ensureRecCases } from "@/server/reconcile";
import { matchBankLine } from "@/server/match-bank";
import { getMessages, getLocaleTag } from "@/i18n";
import { formatVnd } from "@/lib/format";
import { ReconcileActions } from "@/components/ReconcileActions";

import type { Prisma } from "@prisma/client";

type RecCaseRow = Prisma.RecCaseGetPayload<{
  include: { bank_line: true; invoice: true };
}>;
type InvoiceRow = Prisma.InvoiceGetPayload<{
  include: { order: { include: { customer: true } } };
}>;

export const dynamic = "force-dynamic";

function dateIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ReconcilePage() {
  const role = await getDemoRole();
  const t = await getMessages();
  const locale = await getLocaleTag();

  if (!canReadBankQueue(role)) {
    return (
      <div className="rounded-xl border border-clay/40 bg-clay/10 p-6">
        <h1 className="font-display text-2xl">Reconcile</h1>
        <p className="mt-2">{t.reconcileForbidden}</p>
      </div>
    );
  }

  await ensureRecCases();
  const cases = await prisma.recCase.findMany({
    include: { bank_line: true, invoice: true },
    orderBy: { bank_line: { posted_on: "desc" } },
  });
  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { customer: true } } },
  });
  const invoiceInputs = invoices.map((inv: InvoiceRow) => ({
    id: inv.id,
    number: inv.number,
    total_vnd: inv.total_vnd,
    issued_on: inv.issued_on ? dateIso(inv.issued_on) : null,
    customer_name: inv.order?.customer.name ?? "Customer",
  }));

  let summary: { count: number; total: number } | null = null;
  if (canReadReconcileSummary(role)) {
    const open = cases.filter((c: RecCaseRow) =>
      ["proposed", "ambiguous", "unmatched"].includes(c.status),
    );
    summary = {
      count: open.length,
      total: open.reduce(
        (s: number, c: RecCaseRow) => s + c.bank_line.amount_vnd,
        0,
      ),
    };
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Reconcile</h1>
      {summary && (
        <p className="text-sm text-cocoa/80">
          Open: {summary.count} · {formatVnd(summary.total, locale)}
        </p>
      )}
      <div className="space-y-4">
        {cases.map((c: RecCaseRow) => {
          const match = matchBankLine(
            {
              id: c.bank_line.id,
              posted_on: dateIso(c.bank_line.posted_on),
              amount_vnd: c.bank_line.amount_vnd,
              description: c.bank_line.description,
            },
            invoiceInputs.filter((i: { issued_on: string | null }) => i.issued_on),
            [],
          );
          const explanation =
            locale === "vi" ? c.explanation_vi : c.explanation_en;
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 ${c.status === "ambiguous" ? "border-caramel" : "border-pandan/40"}`}
            >
              <p className="font-medium">
                {c.bank_line.id} · {formatVnd(c.bank_line.amount_vnd, locale)}
              </p>
              <p className="text-sm text-cocoa/70">{c.bank_line.description}</p>
              <p className="text-sm">
                {c.status} · confidence {String(c.confidence)}
              </p>
              <p className="mt-2 text-sm">{explanation}</p>
              {c.status !== "confirmed" && c.status !== "rejected" && (
                <ReconcileActions
                  caseId={c.id}
                  needsChoice={c.needs_choice}
                  candidates={match.candidates.map((x) => ({
                    invoice_id: x.invoice_id,
                    invoice_number: x.invoice_number,
                  }))}
                  labels={{ choose: t.chooseInvoice, confirm: t.confirmMatch }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
