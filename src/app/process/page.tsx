import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProcessPage() {
  const locale = await getLocale();
  const steps = await prisma.processStep.findMany({
    include: { requirements: true },
    orderBy: [{ stream: "asc" }, { sort_order: "asc" }],
  });
  const streams = ["sales", "finance", "pos"] as const;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Process</h1>
      {streams.map((stream) => (
        <section key={stream}>
          <h2 className="font-display text-2xl capitalize">{stream}</h2>
          <ol className="mt-3 space-y-3">
            {steps
              .filter((s) => s.stream === stream)
              .map((s) => (
                <li key={s.id} className="rounded-xl border border-cocoa/20 p-4">
                  <p className="font-medium">
                    {locale === "vi" ? s.name_vi : s.name_en}
                  </p>
                  <p className="text-sm text-cocoa/70">{s.system_name}</p>
                  {s.requirements.map((r) => (
                    <div
                      key={r.id}
                      className="mt-2 rounded border border-pandan/30 bg-pandan/5 p-2 text-sm"
                    >
                      <strong>{r.id}</strong> —{" "}
                      {locale === "vi" ? r.statement_vi : r.statement_en}
                    </div>
                  ))}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
