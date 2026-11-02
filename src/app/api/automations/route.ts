import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { getDemoRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await getDemoRole();
  const flow = await prisma.automationFlow.findUnique({ where: { key: "close_shift" } });
  const runs = await prisma.automationRun.findMany({
    where: { flow_key: "close_shift" },
    orderBy: { created_at: "desc" },
    take: 20,
  });
  const mappedRuns =
    role === "leadership"
      ? runs.map((r) => ({
          id: r.id,
          flow_key: r.flow_key,
          status: r.status,
          created_at: r.created_at,
          log: {
            status: r.status,
            break_vnd: (r.redacted_input as { break_vnd?: number }).break_vnd,
          },
        }))
      : runs;
  return jsonOk({ flow, runs: mappedRuns });
}
