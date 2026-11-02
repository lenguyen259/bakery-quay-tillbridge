# Security — Quầy Tillbridge

Portfolio demonstration only. Not production-ready for live personal or financial data.

## Authorization model

- Demo identity is a cookie `demo_role` (`sales` | `finance` | `leadership`). This proves **server-side policy**, not real authentication.
- Sales: CRM and orders; masked tax code and phone; **403** on bank queue and audit.
- Finance: full PII, invoice issue/void, reconcile confirm, shift-close automation.
- Leadership: reconcile **summary** totals only; cannot confirm matches or void invoices.

## Data minimization for AI

- `toModelPayload` in `src/server/redact.ts` strips `tax_code`, `phone`, `account_last4`, and digit runs ≥ 8 in free text.
- Stored automation input uses the same redacted shape (`automation_run.redacted_input`).
- VAT only in `src/server/vat.ts`. Bank matching only in `src/server/match-bank.ts`. The model must not choose ambiguous winners.

## Audit

Confirm match, void invoice, role switch, and similar mutating actions write `audit_event` rows.

## Production gaps (from shared architecture)

- No SSO, no field-level encryption, no penetration test.
- Seed bank descriptions and CRM notes are fictional.
- In-process rate limit on AI routes — not multi-region.
- A real rollout needs SSO, audit export, backup, and a data-processing agreement before live data.

## Role matrix (summary)

| Action | sales | finance | leadership |
| --- | --- | --- | --- |
| Bank queue | no | yes | no (summary only) |
| Confirm match | no | yes | no |
| Full tax/phone | no | yes | no |
| Audit (full detail) | no | yes | yes (no raw payload blobs) |
