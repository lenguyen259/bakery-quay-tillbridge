import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canReadBankQueue } from "@/server/policy";
import { ensureRecCases } from "@/server/reconcile";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getDemoRole();
  if (!canReadBankQueue(role)) {
    return jsonError(
      "FORBIDDEN",
      "Sales and leadership cannot read the bank queue",
      "Sales và leadership không xem hàng đợi ngân hàng",
      403,
    );
  }
  await ensureRecCases();
  const cases = await prisma.recCase.findMany({
    include: {
      bank_line: true,
      invoice: true,
    },
    orderBy: { bank_line: { posted_on: "desc" } },
  });
  return jsonOk(cases);
}
