import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";
import { canConfirmReconcile } from "@/server/policy";
import { writeAudit } from "@/server/reconcile";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const role = await getDemoRole();
  if (!canConfirmReconcile(role)) {
    return jsonError("FORBIDDEN", "Finance only", "Chỉ finance", 403);
  }
  const { id } = await ctx.params;
  const updated = await prisma.recCase.update({
    where: { id },
    data: { status: "rejected" },
  });
  await writeAudit(role, "reconcile.reject", "rec_case", id, {});
  return jsonOk(updated);
}
