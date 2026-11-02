import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDemoRole } from "@/lib/session";
import { canReadFullPii } from "@/server/policy";
import { maskPhone, maskTaxCode } from "@/server/redact";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const role = await getDemoRole();
  const full = canReadFullPii(role);
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">CRM</h1>
      <ul className="divide-y divide-cocoa/10 rounded-xl border border-cocoa/20 bg-paper">
        {customers.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <Link href={`/crm/${c.id}`} className="font-medium text-pandan hover:underline">
                {c.name}
              </Link>
              <p className="text-sm text-cocoa/70">{c.segment}</p>
            </div>
            <div className="text-sm">
              {full ? (
                <>
                  <p>MST: {c.tax_code}</p>
                  <p>SĐT: {c.phone}</p>
                </>
              ) : (
                <>
                  <p>MST: {maskTaxCode(c.tax_code)}</p>
                  <p>SĐT: {maskPhone(c.phone)}</p>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
