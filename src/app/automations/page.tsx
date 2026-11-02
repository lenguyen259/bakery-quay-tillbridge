import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const flow = await prisma.automationFlow.findUnique({ where: { key: "close_shift" } });
  const runs = await prisma.automationRun.findMany({
    where: { flow_key: "close_shift" },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Automations</h1>
      <pre className="overflow-auto rounded-xl border border-cocoa/20 bg-paper p-4 text-xs">
        {JSON.stringify(flow?.definition, null, 2)}
      </pre>
      <h2 className="font-display text-xl">Run log</h2>
      <ul className="space-y-3">
        {runs.map((r) => (
          <li key={r.id} className="rounded border border-cocoa/20 p-3 text-sm">
            <p>
              {r.id} · {r.status} · {r.idempotency_key}
            </p>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(r.log, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
