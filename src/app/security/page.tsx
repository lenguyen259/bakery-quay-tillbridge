import type { AuditEvent } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toModelPayload, payloadForbiddenStrings } from "@/server/redact";
import { getDemoRole } from "@/lib/session";
import { canReadAudit } from "@/server/policy";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const role = await getDemoRole();
  const atelier = await prisma.customer.findUnique({ where: { id: "cus-atelier" } });
  const payload = toModelPayload({
    line: {
      amount_vnd: 1250000,
      posted_on: "2026-11-02",
      description: "CHUYEN KHOAN 1250000",
      account_last4: "4412",
    },
    candidates: [
      { invoice_number: "HĐ-1042", amount_vnd: 1250000, customer_name: "Atelier Demo Co." },
    ],
  });
  const forbidden = payloadForbiddenStrings(payload);
  const audits: AuditEvent[] = canReadAudit(role)
    ? await prisma.auditEvent.findMany({ orderBy: { at: "desc" }, take: 10 })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Security</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-cocoa/20 p-4 text-sm">
          <h2 className="font-display text-lg">Stored (Atelier)</h2>
          <p>Tax: {atelier?.tax_code}</p>
          <p>Phone: {atelier?.phone}</p>
        </div>
        <div className="rounded-xl border border-pandan/40 p-4 text-sm">
          <h2 className="font-display text-lg">Model payload</h2>
          <pre className="overflow-auto text-xs">{JSON.stringify(payload, null, 2)}</pre>
          <p className="mt-2 text-pandan">
            Forbidden check: {forbidden.length === 0 ? "pass" : forbidden.join(", ")}
          </p>
        </div>
      </div>
      <section>
        <h2 className="font-display text-xl">Role matrix</h2>
        <p className="text-sm text-cocoa/80">
          Sales: no bank queue, masked PII. Finance: full PII, confirm matches. Leadership:
          summary only, no confirm.
        </p>
      </section>
      {audits.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Recent audit</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {audits.map((a) => (
              <li key={a.id}>
                {a.action} · {a.entity}/{a.entity_id}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
