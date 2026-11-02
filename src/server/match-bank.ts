export const AMOUNT_TOLERANCE_VND = 1000;

export type MatchBankLineInput = {
  id: string;
  posted_on: string;
  amount_vnd: number;
  description: string;
};

export type MatchInvoiceInput = {
  id: string;
  number: string;
  total_vnd: number;
  issued_on: string | null;
  customer_name: string;
};

export type MatchShiftInput = {
  id: string;
  business_date: string;
  ticket_total_vnd: number;
};

export type MatchCandidate = {
  invoice_id: string;
  invoice_number: string;
  amount_vnd: number;
  customer_name: string;
  strong_reference: boolean;
};

export type MatchResult = {
  status: "proposed" | "ambiguous" | "unmatched";
  confidence: number;
  needs_choice: boolean;
  invoice_id: string | null;
  candidates: MatchCandidate[];
};

export function normalizeInvoiceNumber(number: string): string {
  return number
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase();
}

function parseDateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function isInDateWindow(
  bankPostedOn: string,
  targetDate: string | null,
): boolean {
  if (!targetDate) return false;
  const bank = parseDateOnly(bankPostedOn);
  const target = parseDateOnly(targetDate);
  const prev = new Date(bank);
  prev.setUTCDate(prev.getUTCDate() - 1);
  const bankDay = bank.toISOString().slice(0, 10);
  const prevDay = prev.toISOString().slice(0, 10);
  const targetDay = target.toISOString().slice(0, 10);
  return targetDay === bankDay || targetDay === prevDay;
}

function descriptionContainsInvoiceNumber(
  description: string,
  invoiceNumber: string,
): boolean {
  const normDesc = normalizeInvoiceNumber(description);
  const normInv = normalizeInvoiceNumber(invoiceNumber);
  if (!normInv) return false;
  return normDesc.includes(normInv);
}

function amountMatches(lineAmount: number, invoiceTotal: number): boolean {
  return Math.abs(lineAmount - invoiceTotal) <= AMOUNT_TOLERANCE_VND;
}

export function matchBankLine(
  line: MatchBankLineInput,
  invoices: MatchInvoiceInput[],
  _shifts: MatchShiftInput[],
): MatchResult {
  const eligible = invoices.filter(
    (inv) =>
      inv.issued_on &&
      isInDateWindow(line.posted_on, inv.issued_on) &&
      amountMatches(line.amount_vnd, inv.total_vnd),
  );

  const withReference = eligible.map((inv) => ({
    invoice_id: inv.id,
    invoice_number: inv.number,
    amount_vnd: inv.total_vnd,
    customer_name: inv.customer_name,
    strong_reference: descriptionContainsInvoiceNumber(
      line.description,
      inv.number,
    ),
  }));

  const strong = withReference.filter((c) => c.strong_reference);

  if (strong.length === 1) {
    return {
      status: "proposed",
      confidence: 0.9,
      needs_choice: false,
      invoice_id: strong[0].invoice_id,
      candidates: strong,
    };
  }

  if (withReference.length >= 2) {
    return {
      status: "ambiguous",
      confidence: 0.4,
      needs_choice: true,
      invoice_id: null,
      candidates: withReference,
    };
  }

  if (withReference.length === 1 && strong.length === 0) {
    return {
      status: "proposed",
      confidence: 0.6,
      needs_choice: true,
      invoice_id: withReference[0].invoice_id,
      candidates: withReference,
    };
  }

  return {
    status: "unmatched",
    confidence: 0,
    needs_choice: false,
    invoice_id: null,
    candidates: [],
  };
}
