import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canReadFullPii } from "@/server/policy";
import { maskPhone, maskTaxCode } from "@/server/redact";

export const dynamic = "force-dynamic";

function mapCustomer(
  c: {
    id: string;
    name: string;
    segment: string;
    tax_code: string | null;
    phone: string | null;
    district: string | null;
  },
  fullPii: boolean,
) {
  if (fullPii) {
    return {
      id: c.id,
      name: c.name,
      segment: c.segment,
      district: c.district,
      tax_code: c.tax_code,
      phone: c.phone,
    };
  }
  return {
    id: c.id,
    name: c.name,
    segment: c.segment,
    district: c.district,
    tax_code_masked: maskTaxCode(c.tax_code),
    phone_masked: maskPhone(c.phone),
  };
}

export async function GET() {
  const role = await getDemoRole();
  const full = canReadFullPii(role);
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return jsonOk(customers.map((c) => mapCustomer(c, full)));
}
