const FORBIDDEN_INVOICE_AMOUNTS = [888888, 999000, 100000, 80000];

const SO200_ALLOWED_AMOUNTS = new Set([
  4,
  350000,
  1400000,
  112000,
  1512000,
  15,
  30,
  10,
  2026,
  12,
]);

function extractIntegers(text: string): number[] {
  const matches = text.match(/\d+/g);
  return matches ? matches.map((m) => Number(m)) : [];
}

export function validateInvoiceNarrationSo200(
  narrationEn: string,
  narrationVi: string,
): boolean {
  const blob = `${narrationEn} ${narrationVi}`;
  const nums = extractIntegers(blob);
  for (const n of nums) {
    if (FORBIDDEN_INVOICE_AMOUNTS.includes(n)) {
      return false;
    }
    if (n >= 10000 && !SO200_ALLOWED_AMOUNTS.has(n)) {
      return false;
    }
  }
  return true;
}

export function validateReconcileExplanation(
  bankLineId: string,
  candidates: string[],
  explanationEn: string,
  explanationVi: string,
  cited: string[],
): boolean {
  if (cited.some((n) => !candidates.includes(n))) {
    return false;
  }
  const blob = `${explanationEn} ${explanationVi}`.toLowerCase();
  if (bankLineId === "bl-77") {
    if (candidates.length < 2) {
      return true;
    }
    const mentions = candidates.filter((c) =>
      blob.includes(c.toLowerCase()),
    );
    if (mentions.length < 2) {
      return false;
    }
    const pickPhrases = [
      "choose hd-1042 only",
      "matched hd-1042",
      "is hd-1042",
      "use hd-1042",
      "chọn hd-1042",
      "khớp hd-1042",
    ];
    if (
      pickPhrases.some((p) => blob.includes(p.replace("hd", "hđ"))) ||
      /\bmatched\b.*\bhd-1042\b/i.test(blob) ||
      /\b(is|use)\s+hđ-1042\b/i.test(blob)
    ) {
      if (!blob.includes("hđ-1048") && !blob.includes("1048")) {
        return false;
      }
    }
  }
  return true;
}

export function validateShiftCloseNote(
  noteEn: string,
  noteVi: string,
  breakVnd: number,
  redactedInput: Record<string, unknown>,
): boolean {
  const blob = `${noteEn} ${noteVi}`;
  const nums = extractIntegers(blob);
  if (!nums.includes(Math.abs(breakVnd))) {
    return false;
  }
  const forbidden = ["0312345678", "0901234567", "4412"];
  const raw = JSON.stringify(redactedInput);
  for (const f of forbidden) {
    if (blob.includes(f) || raw.includes(f)) {
      return false;
    }
  }
  return true;
}
