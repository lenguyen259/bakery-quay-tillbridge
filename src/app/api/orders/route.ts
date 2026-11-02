import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await prisma.salesOrder.findMany({
    include: { customer: true, lines: true },
    orderBy: { ordered_on: "desc" },
  });
  return jsonOk(orders);
}
