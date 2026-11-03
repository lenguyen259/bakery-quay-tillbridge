import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateInvoiceNarrationSo200,
  validateReconcileExplanation,
  validateShiftCloseNote,
} from "../src/lib/ai/grounding";
import { demoExplanationBl77, demoInvoiceNarrationSo200 } from "../src/lib/ai/demo-fixtures";

describe("ai grounding", () => {
  it("accepts demo so-200 narration without money drift", () => {
    const demo = demoInvoiceNarrationSo200();
    assert.equal(
      validateInvoiceNarrationSo200(demo.narration_en, demo.narration_vi),
      true,
    );
  });

  it("rejects invented VAT on invoice narration", () => {
    assert.equal(
      validateInvoiceNarrationSo200(
        "VAT is 999000 on this invoice",
        "Thuế 999000",
      ),
      false,
    );
  });

  it("accepts bl-77 demo ambiguity copy", () => {
    const demo = demoExplanationBl77();
    assert.equal(
      validateReconcileExplanation(
        "bl-77",
        ["HĐ-1042", "HĐ-1048"],
        demo.explanation_en,
        demo.explanation_vi,
        demo.cited_invoice_numbers,
      ),
      true,
    );
  });

  it("rejects picking one invoice for bl-77", () => {
    assert.equal(
      validateReconcileExplanation(
        "bl-77",
        ["HĐ-1042", "HĐ-1048"],
        "The transfer clearly matches HĐ-1042.",
        "Khớp HĐ-1042.",
        ["HĐ-1042"],
      ),
      false,
    );
  });

  it("requires shift note to cite break amount", () => {
    assert.equal(
      validateShiftCloseNote(
        "Shift balanced with no issues.",
        "Ca cân bằng.",
        45000,
        { break_vnd: 45000 },
      ),
      false,
    );
  });
});
