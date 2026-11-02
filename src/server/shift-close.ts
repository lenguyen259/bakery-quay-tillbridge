export const BREAK_EXCEPTION_THRESHOLD_VND = 20000;

export type ShiftCloseInput = {
  shift_id: string;
  outlet_id: string;
  business_date: string;
  ticket_total_vnd: number;
  cash_vnd: number;
  card_vnd: number;
};

export type ShiftCloseComputed = {
  declared_total_vnd: number;
  break_vnd: number;
  status: "completed" | "exception";
  idempotency_key: string;
  redacted_input: Record<string, unknown>;
};

export function computeShiftClose(input: ShiftCloseInput): ShiftCloseComputed {
  const declared_total_vnd = input.cash_vnd + input.card_vnd;
  const break_vnd = input.ticket_total_vnd - declared_total_vnd;
  const status =
    Math.abs(break_vnd) > BREAK_EXCEPTION_THRESHOLD_VND
      ? "exception"
      : "completed";

  return {
    declared_total_vnd,
    break_vnd,
    status,
    idempotency_key: `close_shift:${input.shift_id}`,
    redacted_input: {
      outlet_id: input.outlet_id,
      business_date: input.business_date,
      ticket_total: input.ticket_total_vnd,
      declared_total: declared_total_vnd,
      break_vnd,
    },
  };
}
