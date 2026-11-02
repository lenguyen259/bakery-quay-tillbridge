import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canReadReconcileSummary } from "@/server/policy";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getDemoRole();
  if (!canReadReconcileSummary(role)) {
    return jsonError("FORBIDDEN", "Not allowed", "Không được phép", 403);
  }
  const open = await prisma.recCase.findMany({
    where: { status: { in: ["proposed", "ambiguous", "unmatched"] } },
    include: { bank_line: true },
  });
  const openTotal = open.reduce((s, c) => s + c.bank_line.amount_vnd, 0);
  return jsonOk({
    open_case_count: open.length,
    open_total_vnd: openTotal,
  });
}
