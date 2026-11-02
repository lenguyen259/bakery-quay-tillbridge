import { prisma } from "@/lib/db";
import { explainReconcile } from "@/lib/ai/client";
import { matchBankLine, type MatchInvoiceInput } from "@/server/match-bank";
import { toModelPayload } from "@/server/redact";
import type { Prisma } from "@prisma/client";

type InvoiceWithCustomer = Prisma.InvoiceGetPayload<{
  include: { order: { include: { customer: true } } };
}>;

function dateToIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function ensureRecCases(): Promise<void> {
  const bankLines = await prisma.bankLine.findMany({
    include: { recCase: true },
  });
  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { customer: true } } },
  });
  const invoiceInputs: MatchInvoiceInput[] = invoices.map((inv: InvoiceWithCustomer) => ({
    id: inv.id,
    number: inv.number,
    total_vnd: inv.total_vnd,
    issued_on: inv.issued_on ? dateToIso(inv.issued_on) : null,
    customer_name:
      inv.order?.customer.name ??
      (inv.number === "HĐ-1100" ? "Retail Demo" : "Customer"),
  }));

  for (const line of bankLines) {
    if (
      line.recCase &&
      (line.recCase.status === "confirmed" || line.recCase.status === "rejected")
    ) {
      continue;
    }
    const result = matchBankLine(
      {
        id: line.id,
        posted_on: dateToIso(line.posted_on),
        amount_vnd: line.amount_vnd,
        description: line.description,
      },
      invoiceInputs.filter((i: MatchInvoiceInput) => i.issued_on),
      [],
    );

    const candidates = result.candidates.map((c) => ({
      invoice_number: c.invoice_number,
      amount_vnd: c.amount_vnd,
      customer_name: c.customer_name,
    }));
    const payload = toModelPayload({
      line: {
        amount_vnd: line.amount_vnd,
        posted_on: dateToIso(line.posted_on),
        description: line.description,
        account_last4: line.account_last4,
      },
      candidates,
    });

    const explanation = await explainReconcile(
      line.id,
      candidates.map((c) => c.invoice_number),
    );

    const caseId = line.recCase?.id ?? `rec-${line.id}`;
    const data = {
      status: result.status,
      invoice_id: result.invoice_id,
      confidence: result.confidence,
      needs_choice: result.needs_choice,
      explanation_en: explanation.explanation_en,
      explanation_vi: explanation.explanation_vi,
      mode: explanation.mode,
    };

    if (line.recCase) {
      if (
        line.recCase.status === "proposed" ||
        line.recCase.status === "ambiguous" ||
        line.recCase.status === "unmatched"
      ) {
        await prisma.recCase.update({
          where: { id: line.recCase.id },
          data,
        });
      }
    } else {
      await prisma.recCase.create({
        data: {
          id: caseId,
          bank_line_id: line.id,
          ...data,
        },
      });
    }

    void payload;
  }
}

export async function writeAudit(
  actor: string,
  action: string,
  entity: string,
  entity_id: string,
  detail: Record<string, unknown>,
) {
  await prisma.auditEvent.create({
    data: {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actor,
      action,
      entity,
      entity_id,
      detail,
    },
  });
}
