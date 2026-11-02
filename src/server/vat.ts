export function calcVatVnd(subtotalVnd: number, vatRateBps: number): number {
  return Math.round((subtotalVnd * vatRateBps) / 10000);
}

export type InvoiceLineInput = {
  qty: number;
  unit_price_vnd: number;
};

export function invoiceTotalsFromLines(
  lines: InvoiceLineInput[],
  vatRateBps: number,
): { subtotal_vnd: number; vat_vnd: number; total_vnd: number } {
  const subtotal_vnd = lines.reduce(
    (sum, line) => sum + line.qty * line.unit_price_vnd,
    0,
  );
  const vat_vnd = calcVatVnd(subtotal_vnd, vatRateBps);
  return { subtotal_vnd, vat_vnd, total_vnd: subtotal_vnd + vat_vnd };
}
