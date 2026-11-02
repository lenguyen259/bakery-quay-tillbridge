import { getLocale } from "@/lib/session";

export async function TrustPanel() {
  const locale = await getLocale();
  const copy =
    locale === "vi"
      ? "Mô hình giải thích khớp ngân hàng và diễn giải hóa đơn; không tính thuế và không chọn hoá đơn thắng."
      : "The model explains matches and invoice narration; it does not compute tax or pick winning invoices.";
  return (
    <aside className="rounded-lg border border-clay/30 bg-clay/5 p-4 text-sm">
      <p>{copy}</p>
    </aside>
  );
}
