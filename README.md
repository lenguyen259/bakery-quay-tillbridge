# Quầy Tillbridge

Portfolio demo for a fictional HCMC bakery counter (CRM, POS, reconciliation). **Not** a live production system.

**Quầy** — CRM, ERP-style documents, POS shifts, and bank reconciliation in one Postgres schema. VAT and bank matching are pure TypeScript; the LLM explains in Vietnamese/English from redacted payloads only.

## Stack

- Next.js App Router, TypeScript, Tailwind
- Prisma + Neon PostgreSQL
- Vercel AI SDK (`generateObject` + Zod) — see `src/lib/ai/client.ts`
- Tests: `tsx --test`

## Local setup

```powershell
cd projects/quay-tillbridge
copy .env.example .env
# Set DATABASE_URL and DIRECT_URL (Neon pooled + direct)
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000. Default locale Vietnamese; use **EN** in the header to toggle. Switch demo role (sales / finance / leadership) in the header.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm test` | VAT, matcher, redaction, policy |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | `prisma generate && next build` |

## Environment

See `.env.example`. `AI_DEMO_MODE=auto` uses fixtures when `OPENAI_API_KEY` is empty. `AUTOMATION_WEBHOOK_URL` is optional — when set, shift-close POSTs `{ id, flow_key, break_vnd }` for n8n/Make.

## JD highlights

- Sales + finance + POS **process maps** at `/process` (`QT-R01`–`QT-R08`)
- One database: accounts, orders, invoices, stock, shifts, bank lines
- HTTP APIs under `/api/*` with server-side role checks
- Shift-close automation log + webhook slot at `/automations`
- Security: role matrix, masking, redaction — `/security`
- Honest limit: the model does **not** calculate VAT or post cash

## Deploy

Vercel build command: `prisma generate && next build`. Run migrations and seed from your machine against Neon (not in the build step).

---

> Bản minh hoạ portfolio cho chương trình bánh và F&B giả lập — không phải hệ thống sản xuất thật. Dữ liệu là giả lập cho bếp demo tại TP.HCM.
