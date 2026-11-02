import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { shiftCloseNote } from "@/lib/ai/client";
import { getDemoRole } from "@/lib/session";
import { canCloseShift } from "@/server/policy";
import { computeShiftClose } from "@/server/shift-close";

export const dynamic = "force-dynamic";

async function fireWebhook(runId: string, flowKey: string, breakVnd: number) {
  const url = process.env.AUTOMATION_WEBHOOK_URL?.trim();
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: runId, flow_key: flowKey, break_vnd: breakVnd }),
  }).catch(() => undefined);
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const role = await getDemoRole();
  if (!canCloseShift(role)) {
    return jsonError("FORBIDDEN", "Finance only", "Chỉ finance", 403);
  }
  const { id } = await ctx.params;
  const shift = await prisma.posShift.findUnique({
    where: { id },
    include: { tickets: true },
  });
  if (!shift) {
    return jsonError("NOT_FOUND", "Shift not found", "Không có ca", 404);
  }

  const ticketSum = shift.tickets.reduce((s, t) => s + t.total_vnd, 0);
  const computed = computeShiftClose({
    shift_id: shift.id,
    outlet_id: shift.outlet_id,
    business_date: shift.business_date.toISOString().slice(0, 10),
    ticket_total_vnd: ticketSum,
    cash_vnd: shift.cash_vnd,
    card_vnd: shift.card_vnd,
  });

  const existing = await prisma.automationRun.findUnique({
    where: { idempotency_key: computed.idempotency_key },
  });
  if (existing) {
    return jsonOk(existing);
  }

  const note = await shiftCloseNote(computed.redacted_input);
  const runId = `run-${shift.id}`;
  const run = await prisma.automationRun.create({
    data: {
      id: runId,
      flow_key: "close_shift",
      idempotency_key: computed.idempotency_key,
      status: computed.status,
      redacted_input: computed.redacted_input,
      log: {
        steps: [
          "Sum tickets",
          "Compare declared",
          computed.status === "exception" ? "Mark exception" : "Within threshold",
          note.note_en,
        ],
        note_en: note.note_en,
        note_vi: note.note_vi,
        mode: note.mode,
      },
    },
  });

  await fireWebhook(run.id, "close_shift", computed.break_vnd);
  return jsonOk(run);
}
