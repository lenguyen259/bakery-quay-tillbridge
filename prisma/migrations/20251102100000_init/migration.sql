-- CreateSchema
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "tax_code" TEXT,
    "phone" TEXT,
    "district" TEXT,
    "owner_user_id" TEXT NOT NULL,
    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_activity" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "crm_activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "item" (
    "sku" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "unit_price_vnd" INTEGER NOT NULL,
    "vat_rate_bps" INTEGER NOT NULL,
    CONSTRAINT "item_pkey" PRIMARY KEY ("sku")
);

CREATE TABLE "sales_order" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ordered_on" DATE NOT NULL,
    "note" TEXT,
    CONSTRAINT "sales_order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sales_order_line" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price_vnd" INTEGER NOT NULL,
    CONSTRAINT "sales_order_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issued_on" DATE,
    "subtotal_vnd" INTEGER NOT NULL,
    "vat_vnd" INTEGER NOT NULL,
    "total_vnd" INTEGER NOT NULL,
    "narration_en" TEXT,
    "narration_vi" TEXT,
    "narration_mode" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_line" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price_vnd" INTEGER NOT NULL,
    "line_subtotal_vnd" INTEGER NOT NULL,
    CONSTRAINT "invoice_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_move" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "order_id" TEXT,
    "at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "stock_move_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_shift" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "business_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "cash_vnd" INTEGER NOT NULL DEFAULT 0,
    "card_vnd" INTEGER NOT NULL DEFAULT 0,
    "ticket_total_vnd" INTEGER NOT NULL DEFAULT 0,
    "break_vnd" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "pos_shift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_ticket" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "total_vnd" INTEGER NOT NULL,
    "paid_via" TEXT NOT NULL,
    CONSTRAINT "pos_ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bank_line" (
    "id" TEXT NOT NULL,
    "posted_on" DATE NOT NULL,
    "amount_vnd" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "account_last4" TEXT NOT NULL,
    CONSTRAINT "bank_line_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rec_case" (
    "id" TEXT NOT NULL,
    "bank_line_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "invoice_id" TEXT,
    "shift_id" TEXT,
    "confidence" DECIMAL(4,2) NOT NULL,
    "needs_choice" BOOLEAN NOT NULL DEFAULT false,
    "explanation_en" TEXT,
    "explanation_vi" TEXT,
    "mode" TEXT,
    CONSTRAINT "rec_case_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "automation_flow" (
    "key" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    CONSTRAINT "automation_flow_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "automation_run" (
    "id" TEXT NOT NULL,
    "flow_key" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "log" JSONB NOT NULL,
    "redacted_input" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_run_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "process_step" (
    "id" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_vi" TEXT NOT NULL,
    "owner_role" TEXT NOT NULL,
    "input_en" TEXT NOT NULL,
    "output_en" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "pain_en" TEXT NOT NULL,
    "pain_vi" TEXT NOT NULL,
    CONSTRAINT "process_step_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "requirement" (
    "id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "statement_en" TEXT NOT NULL,
    "statement_vi" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "acceptance_en" TEXT NOT NULL,
    CONSTRAINT "requirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoice_number_key" ON "invoice"("number");
CREATE UNIQUE INDEX "rec_case_bank_line_id_key" ON "rec_case"("bank_line_id");
CREATE UNIQUE INDEX "automation_run_idempotency_key_key" ON "automation_run"("idempotency_key");

ALTER TABLE "customer" ADD CONSTRAINT "customer_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales_order" ADD CONSTRAINT "sales_order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales_order_line" ADD CONSTRAINT "sales_order_line_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales_order_line" ADD CONSTRAINT "sales_order_line_sku_fkey" FOREIGN KEY ("sku") REFERENCES "item"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_sku_fkey" FOREIGN KEY ("sku") REFERENCES "item"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_sku_fkey" FOREIGN KEY ("sku") REFERENCES "item"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_ticket" ADD CONSTRAINT "pos_ticket_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "pos_shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rec_case" ADD CONSTRAINT "rec_case_bank_line_id_fkey" FOREIGN KEY ("bank_line_id") REFERENCES "bank_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rec_case" ADD CONSTRAINT "rec_case_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rec_case" ADD CONSTRAINT "rec_case_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "pos_shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "automation_run" ADD CONSTRAINT "automation_run_flow_key_fkey" FOREIGN KEY ("flow_key") REFERENCES "automation_flow"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "requirement" ADD CONSTRAINT "requirement_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "process_step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
