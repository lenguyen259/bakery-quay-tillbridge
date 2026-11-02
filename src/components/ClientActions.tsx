"use client";

export function DraftInvoiceButton({ orderId }: { orderId: string }) {
  async function draft() {
    const res = await fetch(`/api/orders/${orderId}/invoice`, { method: "POST" });
    const json = await res.json();
    if (json.ok) window.location.reload();
    else alert(json.error?.message_en ?? "Failed");
  }
  return (
    <button
      type="button"
      onClick={draft}
      className="rounded bg-pandan px-3 py-2 text-sm text-paper"
    >
      Draft invoice
    </button>
  );
}

export function CloseShiftButton({ shiftId }: { shiftId: string }) {
  async function close() {
    const res = await fetch(`/api/shifts/${shiftId}/close`, { method: "POST" });
    const json = await res.json();
    if (json.ok) window.location.reload();
    else alert(json.error?.message_en ?? "Failed");
  }
  return (
    <button
      type="button"
      onClick={close}
      className="rounded bg-caramel px-3 py-2 text-sm text-paper"
    >
      Run close-shift automation
    </button>
  );
}
