import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canReadFullPii } from "@/server/policy";
import { maskPhone, maskTaxCode } from "@/server/redact";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const role = await getDemoRole();
  const full = canReadFullPii(role);
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { at: "desc" } },
      salesOrders: { orderBy: { ordered_on: "desc" } },
    },
  });
  if (!customer) {
    return jsonError("NOT_FOUND", "Account not found", "Không tìm thấy khách", 404);
  }
  const base = full
    ? { tax_code: customer.tax_code, phone: customer.phone }
    : {
        tax_code_masked: maskTaxCode(customer.tax_code),
        phone_masked: maskPhone(customer.phone),
      };
  return jsonOk({
    id: customer.id,
    name: customer.name,
    segment: customer.segment,
    district: customer.district,
    ...base,
    activities: customer.activities,
    orders: customer.salesOrders,
  });
}
