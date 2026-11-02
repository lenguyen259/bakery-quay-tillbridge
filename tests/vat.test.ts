import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcVatVnd, invoiceTotalsFromLines } from "../src/server/vat.ts";

describe("vat", () => {
  it("so-200 totals", () => {
    const totals = invoiceTotalsFromLines(
      [{ qty: 4, unit_price_vnd: 350000 }],
      800,
    );
    assert.equal(totals.subtotal_vnd, 1400000);
    assert.equal(totals.vat_vnd, 112000);
    assert.equal(totals.total_vnd, 1512000);
  });

  it("rounding edge case", () => {
    assert.equal(calcVatVnd(111111, 800), 8889);
  });
});
