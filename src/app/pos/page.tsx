import { prisma } from "@/lib/db";
import { formatVnd, formatDate } from "@/lib/format";
import { getLocale } from "@/lib/session";
import { CloseShiftButton } from "@/components/ClientActions";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const locale = await getLocale();
  const shifts = await prisma.posShift.findMany({
    include: { tickets: true },
    orderBy: { business_date: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">POS</h1>
      {shifts.map((s) => (
        <div key={s.id} className="rounded-xl border border-cocoa/20 p-4">
          <p className="font-medium">
            {s.id} · {s.outlet_id} · {formatDate(s.business_date, locale)}
          </p>
          <p className="text-sm">
            Tickets {formatVnd(s.ticket_total_vnd, locale)} · Break{" "}
            {formatVnd(s.break_vnd, locale)}
          </p>
          {s.id === "sh-nh-1101" && <CloseShiftButton shiftId={s.id} />}
        </div>
      ))}
    </div>
  );
}
