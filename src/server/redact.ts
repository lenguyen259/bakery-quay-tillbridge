const DIGIT_RUN_8_PLUS = /\d{8,}/g;

export function redactFreeText(text: string): string {
  return text.replace(DIGIT_RUN_8_PLUS, "[redacted]");
}

export type AtelierAccountFields = {
  tax_code?: string | null;
  phone?: string | null;
  account_last4?: string | null;
};

export function toModelPayload(input: {
  line?: {
    amount_vnd: number;
    posted_on: string;
    description: string;
    account_last4?: string;
  };
  candidates?: Array<{
    invoice_number: string;
    amount_vnd: number;
    customer_name: string;
  }>;
  outlet_id?: string;
  business_date?: string;
  ticket_total?: number;
  declared_total?: number;
  break_vnd?: number;
}): Record<string, unknown> {
  const payload = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;

  if (payload.line && typeof payload.line === "object") {
    const line = payload.line as Record<string, unknown>;
    delete line.account_last4;
    if (typeof line.description === "string") {
      line.description = redactFreeText(line.description);
    }
  }

  return payload;
}

export function maskTaxCode(taxCode: string | null | undefined): string | null {
  if (!taxCode) return null;
  if (taxCode.length <= 3) return taxCode;
  return `${"*".repeat(taxCode.length - 3)}${taxCode.slice(-3)}`;
}

export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  if (phone.length <= 3) return phone;
  return `${"*".repeat(phone.length - 3)}${phone.slice(-3)}`;
}

export function payloadForbiddenStrings(payload: unknown): string[] {
  const json = JSON.stringify(payload);
  const forbidden = ["0312345678", "0901234567"];
  return forbidden.filter((s) => json.includes(s));
}
