import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchBankLine } from "../src/server/match-bank.ts";

const invoices = [
  {
    id: "inv-1042",
    number: "HĐ-1042",
    total_vnd: 1250000,
    issued_on: "2026-11-01",
    customer_name: "Atelier Demo Co.",
  },
  {
    id: "inv-1048",
    number: "HĐ-1048",
    total_vnd: 1250000,
    issued_on: "2026-11-01",
    customer_name: "Café Demo Thảo Điền",
  },
  {
    id: "inv-1100",
    number: "HĐ-1100",
    total_vnd: 756000,
    issued_on: "2026-11-01",
    customer_name: "Retail Demo",
  },
];

describe("matchBankLine", () => {
  it("bl-77 is ambiguous", () => {
    const result = matchBankLine(
      {
        id: "bl-77",
        posted_on: "2026-11-02",
        amount_vnd: 1250000,
        description: "CHUYEN KHOAN 1250000",
      },
      invoices,
      [],
    );
    assert.equal(result.status, "ambiguous");
    assert.equal(result.confidence, 0.4);
    assert.equal(result.invoice_id, null);
    assert.equal(result.needs_choice, true);
    assert.equal(result.candidates.length, 2);
  });

  it("bl-80 proposes HĐ-1100 at 0.9", () => {
    const result = matchBankLine(
      {
        id: "bl-80",
        posted_on: "2026-11-02",
        amount_vnd: 756000,
        description: "HD1100 NGUYEN HUE",
      },
      invoices,
      [],
    );
    assert.equal(result.status, "proposed");
    assert.equal(result.confidence, 0.9);
    assert.equal(result.invoice_id, "inv-1100");
    assert.equal(result.needs_choice, false);
  });
});
