"use client";

import { useState } from "react";

type Candidate = {
  invoice_id: string;
  invoice_number: string;
};

export function ReconcileActions({
  caseId,
  needsChoice,
  candidates,
  labels,
}: {
  caseId: string;
  needsChoice: boolean;
  candidates: Candidate[];
  labels: { choose: string; confirm: string };
}) {
  const [chosen, setChosen] = useState("");
  const [message, setMessage] = useState("");

  async function confirm() {
    setMessage("");
    const res = await fetch(`/api/reconcile/${caseId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        needsChoice ? { chosenInvoiceId: chosen } : {},
      ),
    });
    const json = await res.json();
    if (!json.ok) {
      setMessage(json.error?.message_en ?? "Error");
      return;
    }
    setMessage("Confirmed");
    window.location.reload();
  }

  const disabled = needsChoice && !chosen;

  return (
    <div className="mt-3 space-y-2">
      {needsChoice && (
        <select
          className="w-full rounded border border-cocoa/30 bg-paper px-2 py-1 text-sm"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
        >
          <option value="">{labels.choose}</option>
          {candidates.map((c) => (
            <option key={c.invoice_id} value={c.invoice_id}>
              {c.invoice_number}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={confirm}
        className="rounded bg-pandan px-3 py-1 text-sm text-paper disabled:opacity-40"
      >
        {labels.confirm}
      </button>
      {message && <p className="text-sm text-cocoa">{message}</p>}
    </div>
  );
}
