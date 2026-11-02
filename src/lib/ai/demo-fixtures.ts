import { z } from "zod";

export const explanationSchema = z.object({
  explanation_en: z.string(),
  explanation_vi: z.string(),
  cited_invoice_numbers: z.array(z.string()),
});

export type Explanation = z.infer<typeof explanationSchema>;

export function demoInvoiceNarrationSo200(): {
  narration_en: string;
  narration_vi: string;
} {
  return {
    narration_en:
      "Year-end gift boxes for Atelier Demo Co., referencing the 30 Oct visit. Deliver before 15 Dec.",
    narration_vi:
      "Hộp quà cuối năm cho Atelier Demo Co., theo ghi chú thăm 30/10. Giao trước 15/12.",
  };
}

export function demoExplanationBl77(): Explanation {
  return {
    explanation_en:
      "The transfer amount matches two issued invoices. A finance user must choose HĐ-1042 or HĐ-1048.",
    explanation_vi:
      "Số tiền chuyển khoản trùng hai hóa đơn đã phát hành. Kế toán phải chọn HĐ-1042 hoặc HĐ-1048.",
    cited_invoice_numbers: ["HĐ-1042", "HĐ-1048"],
  };
}

export function demoExplanationBl80(): Explanation {
  return {
    explanation_en:
      "The description references invoice HĐ-1100 and the amount aligns.",
    explanation_vi: "Diễn giải tham chiếu HĐ-1100 và số tiền khớp.",
    cited_invoice_numbers: ["HĐ-1100"],
  };
}

export function demoShiftNoteNh(): { note_en: string; note_vi: string } {
  return {
    note_en:
      "Nguyễn Huệ counter shift is short 45,000₫ against declared takings.",
    note_vi: "Ca quầy Nguyễn Huệ thiếu 45.000₫ so với tiền khai báo.",
  };
}
