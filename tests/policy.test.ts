import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canConfirmReconcile,
  canReadBankQueue,
  canReadFullPii,
} from "../src/server/policy.ts";

describe("policy", () => {
  it("sales cannot read bank queue", () => {
    assert.equal(canReadBankQueue("sales"), false);
    assert.equal(canConfirmReconcile("sales"), false);
    assert.equal(canReadFullPii("sales"), false);
  });

  it("finance can reconcile", () => {
    assert.equal(canReadBankQueue("finance"), true);
    assert.equal(canConfirmReconcile("finance"), true);
    assert.equal(canReadFullPii("finance"), true);
  });

  it("leadership cannot confirm", () => {
    assert.equal(canConfirmReconcile("leadership"), false);
  });
});
