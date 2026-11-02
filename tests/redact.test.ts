import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  payloadForbiddenStrings,
  toModelPayload,
} from "../src/server/redact.ts";

describe("redact", () => {
  it("model payload excludes Atelier tax code and phone", () => {
    const rawAccount = {
      tax_code: "0312345678",
      phone: "0901234567",
    };
    const payload = toModelPayload({
      line: {
        amount_vnd: 1250000,
        posted_on: "2026-11-02",
        description: `CHUYEN KHOAN ${rawAccount.tax_code}`,
        account_last4: "4412",
      },
      candidates: [
        {
          invoice_number: "HĐ-1042",
          amount_vnd: 1250000,
          customer_name: "Atelier Demo Co.",
        },
      ],
    });

    assert.deepEqual(payloadForbiddenStrings(payload), []);
    assert.ok(!JSON.stringify(payload).includes("4412"));
  });
});
