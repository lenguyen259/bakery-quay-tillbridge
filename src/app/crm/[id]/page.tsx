import { prisma } from "@/lib/db";
import { getDemoRole } from "@/lib/session";
import { canReadFullPii } from "@/server/policy";
import { maskPhone, maskTaxCode } from "@/server/redact";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CrmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getDemoRole();
  const locale = await getLocale();
  const full = canReadFullPii(role);
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { at: "desc" } },
      salesOrders: { orderBy: { ordered_on: "desc" } },
    },
  });
  if (!customer) {
    return <p>Not found</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">{customer.name}</h1>
      <div className="text-sm">
        {full ? (
          <>
            <p>Tax: {customer.tax_code}</p>
            <p>Phone: {customer.phone}</p>
          </>
        ) : (
          <>
            <p>Tax: {maskTaxCode(customer.tax_code)}</p>
            <p>Phone: {maskPhone(customer.phone)}</p>
          </>
        )}
      </div>
      <section>
        <h2 className="font-display text-xl">Activities</h2>
        <ul className="mt-2 space-y-2">
          {customer.activities.map((a) => (
            <li key={a.id} className="rounded border border-cocoa/20 p-3 text-sm">
              <p className="text-cocoa/70">{formatDate(a.at, locale)}</p>
              <p>{a.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-xl">Orders</h2>
        <ul className="mt-2 space-y-2">
          {customer.salesOrders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="text-pandan hover:underline">
                {o.id} — {o.status}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
