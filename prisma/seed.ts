import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VAT_BPS = 800;

const items = [
  { sku: "BM-PAT", name_en: "Pâté baguette", name_vi: "Bánh mì pate", unit_price_vnd: 25000 },
  { sku: "CR-BUT", name_en: "Butter croissant", name_vi: "Croissant bơ", unit_price_vnd: 38000 },
  { sku: "TT-EGG", name_en: "Egg tart", name_vi: "Bánh tart trứng", unit_price_vnd: 22000 },
  { sku: "BL-PAN", name_en: "Pandan chiffon slice", name_vi: "Bông lan pandan", unit_price_vnd: 32000 },
  { sku: "SD-CAM", name_en: "Country loaf", name_vi: "Bánh mì men", unit_price_vnd: 45000 },
  { sku: "TR-LY", name_en: "Tiramisu cup", name_vi: "Tiramisu ly", unit_price_vnd: 42000 },
  { sku: "GN-QUE", name_en: "Ginger biscuit tin", name_vi: "Bánh gừng que", unit_price_vnd: 85000 },
  { sku: "GQ-TET", name_en: "Year-end gift box", name_vi: "Hộp quà cuối năm", unit_price_vnd: 350000 },
];

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.automationRun.deleteMany();
  await prisma.recCase.deleteMany();
  await prisma.bankLine.deleteMany();
  await prisma.posTicket.deleteMany();
  await prisma.posShift.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockMove.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.crmActivity.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.processStep.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.item.deleteMany();
  await prisma.automationFlow.deleteMany();
  await prisma.appUser.deleteMany();

  await prisma.appUser.createMany({
    data: [
      { id: "khoa", name: "Khoa Võ", role: "sales" },
      { id: "ha", name: "Hà Lê", role: "finance" },
      { id: "anh", name: "Ánh Đặng", role: "leadership" },
    ],
  });

  for (const item of items) {
    await prisma.item.create({
      data: { ...item, vat_rate_bps: VAT_BPS },
    });
  }

  const customers = [
    {
      id: "cus-atelier",
      name: "Atelier Demo Co.",
      segment: "corporate",
      tax_code: "0312345678",
      phone: "0901234567",
      district: "Quận 1",
      owner_user_id: "khoa",
    },
    {
      id: "cus-cafe-td",
      name: "Café Demo Thảo Điền",
      segment: "cafe",
      tax_code: "0309988776",
      phone: "0909888777",
      district: "Thủ Đức",
      owner_user_id: "khoa",
    },
    {
      id: "cus-retail-pmh",
      name: "Retail Demo PMH",
      segment: "retail",
      tax_code: "0311223344",
      phone: "0912345678",
      district: "Quận 7",
      owner_user_id: "khoa",
    },
    {
      id: "cus-cafe-nh",
      name: "Café Demo Nguyễn Huệ",
      segment: "cafe",
      tax_code: "0300112233",
      phone: "0923456789",
      district: "Quận 1",
      owner_user_id: "khoa",
    },
    {
      id: "cus-corp-d3",
      name: "Corporate Demo D3",
      segment: "corporate",
      tax_code: "0314556677",
      phone: "0934567890",
      district: "Quận 3",
      owner_user_id: "khoa",
    },
    {
      id: "cus-retail-td",
      name: "Retail Demo Thảo Điền",
      segment: "retail",
      tax_code: "0315667788",
      phone: "0945678901",
      district: "Thủ Đức",
      owner_user_id: "khoa",
    },
    {
      id: "cus-internal",
      name: "Internal Demo Kitchen",
      segment: "internal",
      tax_code: null,
      phone: null,
      district: "Quận 3",
      owner_user_id: "khoa",
    },
  ];

  for (const c of customers) {
    await prisma.customer.create({ data: c });
  }

  await prisma.crmActivity.create({
    data: {
      id: "act-atelier-1",
      customer_id: "cus-atelier",
      kind: "visit",
      body: "Year-end gift boxes, deliver before 15 Dec",
      at: new Date("2026-10-30T09:00:00.000Z"),
    },
  });

  await prisma.salesOrder.create({
    data: {
      id: "so-200",
      customer_id: "cus-atelier",
      status: "confirmed",
      ordered_on: new Date("2026-10-31"),
      note: "Gift boxes for year-end",
      lines: {
        create: {
          id: "sol-200-1",
          sku: "GQ-TET",
          qty: 4,
          unit_price_vnd: 350000,
        },
      },
    },
  });

  await prisma.stockMove.createMany({
    data: [
      {
        id: "sm-gq-in",
        sku: "GQ-TET",
        qty: 20,
        direction: "in",
        reason: "purchase",
        at: new Date("2026-10-28T08:00:00.000Z"),
      },
      {
        id: "sm-gq-out",
        sku: "GQ-TET",
        qty: 4,
        direction: "out",
        reason: "reservation",
        order_id: "so-200",
        at: new Date("2026-10-31T10:00:00.000Z"),
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        id: "inv-1042",
        order_id: null,
        number: "HĐ-1042",
        status: "issued",
        issued_on: new Date("2026-11-01"),
        subtotal_vnd: 1157407,
        vat_vnd: 92593,
        total_vnd: 1250000,
      },
      {
        id: "inv-1048",
        order_id: null,
        number: "HĐ-1048",
        status: "issued",
        issued_on: new Date("2026-11-01"),
        subtotal_vnd: 1157407,
        vat_vnd: 92593,
        total_vnd: 1250000,
      },
      {
        id: "inv-1100",
        order_id: null,
        number: "HĐ-1100",
        status: "issued",
        issued_on: new Date("2026-11-01"),
        subtotal_vnd: 700000,
        vat_vnd: 56000,
        total_vnd: 756000,
      },
    ],
  });

  const extraInvoices = [
    { id: "inv-1050", number: "HĐ-1050", total: 880000, customerNote: "cus-retail-pmh" },
    { id: "inv-1055", number: "HĐ-1055", total: 420000, customerNote: "cus-cafe-nh" },
    { id: "inv-1060", number: "HĐ-1060", total: 990000, customerNote: "cus-corp-d3" },
    { id: "inv-1065", number: "HĐ-1065", total: 640000, customerNote: "cus-retail-td" },
  ];
  for (const inv of extraInvoices) {
    const subtotal = Math.round(inv.total / 1.08);
    const vat = inv.total - subtotal;
    await prisma.invoice.create({
      data: {
        id: inv.id,
        number: inv.number,
        status: "issued",
        issued_on: new Date("2026-10-30"),
        subtotal_vnd: subtotal,
        vat_vnd: vat,
        total_vnd: inv.total,
      },
    });
    void inv.customerNote;
  }

  await prisma.bankLine.createMany({
    data: [
      {
        id: "bl-77",
        posted_on: new Date("2026-11-02"),
        amount_vnd: 1250000,
        description: "CHUYEN KHOAN 1250000",
        account_last4: "4412",
      },
      {
        id: "bl-80",
        posted_on: new Date("2026-11-02"),
        amount_vnd: 756000,
        description: "HD1100 NGUYEN HUE",
        account_last4: "4412",
      },
    ],
  });

  await prisma.posShift.create({
    data: {
      id: "sh-nh-1101",
      outlet_id: "CTR-NH",
      business_date: new Date("2026-11-01"),
      status: "closed",
      cash_vnd: 1500000,
      card_vnd: 955000,
      ticket_total_vnd: 2500000,
      break_vnd: 45000,
      tickets: {
        create: [
          { id: "tk-1", ticket_no: "NH-001", total_vnd: 800000, paid_via: "cash" },
          { id: "tk-2", ticket_no: "NH-002", total_vnd: 700000, paid_via: "card" },
          { id: "tk-3", ticket_no: "NH-003", total_vnd: 500000, paid_via: "cash" },
          { id: "tk-4", ticket_no: "NH-004", total_vnd: 500000, paid_via: "card" },
        ],
      },
    },
  });

  await prisma.automationFlow.create({
    data: {
      key: "close_shift",
      name_en: "Close POS shift",
      name_vi: "Đóng ca POS",
      definition: {
        steps: [
          "Sum tickets",
          "Compare declared cash + card",
          "Flag exception if break > 20000",
          "Model plain-language note",
          "Write automation_run",
        ],
      },
    },
  });

  const steps = [
    {
      id: "ps-sales-1",
      stream: "sales",
      sort_order: 1,
      name_en: "Qualify the account",
      name_vi: "Đánh giá khách hàng",
      owner_role: "sales",
      input_en: "Segment and district",
      output_en: "Qualified account",
      system_name: "CRM",
      pain_en: "Notes live in chats",
      pain_vi: "Ghi chú nằm rải rác chat",
      req: "QT-R05",
    },
    {
      id: "ps-sales-2",
      stream: "sales",
      sort_order: 2,
      name_en: "Log the visit note",
      name_vi: "Ghi chú thăm khách",
      owner_role: "sales",
      input_en: "Visit outcome",
      output_en: "CRM activity",
      system_name: "CRM",
      pain_en: "Promise sits in personal chat",
      pain_vi: "Cam kết nằm chat cá nhân",
      req: null,
    },
    {
      id: "ps-sales-3",
      stream: "sales",
      sort_order: 3,
      name_en: "Draft the order",
      name_vi: "Soạn đơn hàng",
      owner_role: "sales",
      input_en: "SKU lines",
      output_en: "Draft order (quote)",
      system_name: "ERP",
      pain_en: "No separate quote table",
      pain_vi: "Không có bảng báo giá riêng",
      req: null,
    },
    {
      id: "ps-sales-4",
      stream: "sales",
      sort_order: 4,
      name_en: "Confirm the order",
      name_vi: "Xác nhận đơn",
      owner_role: "sales",
      input_en: "Draft order",
      output_en: "Confirmed order",
      system_name: "ERP",
      pain_en: "Manual confirmation",
      pain_vi: "Xác nhận thủ công",
      req: "QT-R02",
    },
    {
      id: "ps-fin-1",
      stream: "finance",
      sort_order: 1,
      name_en: "Draft the invoice",
      name_vi: "Soạn hóa đơn",
      owner_role: "finance",
      input_en: "Confirmed order",
      output_en: "Draft invoice",
      system_name: "ERP",
      pain_en: "Lines retyped",
      pain_vi: "Gõ lại dòng hàng",
      req: "QT-R08",
    },
    {
      id: "ps-fin-2",
      stream: "finance",
      sort_order: 2,
      name_en: "Issue the invoice",
      name_vi: "Phát hành hóa đơn",
      owner_role: "finance",
      input_en: "Draft invoice",
      output_en: "Issued invoice",
      system_name: "ERP",
      pain_en: "Tax retyped by hand",
      pain_vi: "Thuế gõ lại tay",
      req: "QT-R01",
    },
    {
      id: "ps-fin-3",
      stream: "finance",
      sort_order: 3,
      name_en: "Import the bank line",
      name_vi: "Nhập dòng ngân hàng",
      owner_role: "finance",
      input_en: "Bank file row",
      output_en: "Bank line",
      system_name: "Bank file",
      pain_en: "CSV manual import",
      pain_vi: "Nhập CSV thủ công",
      req: null,
    },
    {
      id: "ps-fin-4",
      stream: "finance",
      sort_order: 4,
      name_en: "Match or leave ambiguous",
      name_vi: "Khớp hoặc để mơ hồ",
      owner_role: "finance",
      input_en: "Bank line + invoices",
      output_en: "Rec case",
      system_name: "Tillbridge",
      pain_en: "Same amounts collide",
      pain_vi: "Trùng số tiền",
      req: "QT-R03",
    },
    {
      id: "ps-fin-5",
      stream: "finance",
      sort_order: 5,
      name_en: "Confirm the match",
      name_vi: "Xác nhận khớp",
      owner_role: "finance",
      input_en: "Rec case",
      output_en: "Confirmed match",
      system_name: "Tillbridge",
      pain_en: "Model must not post",
      pain_vi: "Mô hình không được ghi",
      req: "QT-R04",
    },
    {
      id: "ps-pos-1",
      stream: "pos",
      sort_order: 1,
      name_en: "Open the shift",
      name_vi: "Mở ca",
      owner_role: "counter lead",
      input_en: "Outlet + date",
      output_en: "Open shift",
      system_name: "POS",
      pain_en: "Manual handover",
      pain_vi: "Bàn giao thủ công",
      req: null,
    },
    {
      id: "ps-pos-2",
      stream: "pos",
      sort_order: 2,
      name_en: "Ring tickets",
      name_vi: "Bán vé",
      owner_role: "counter",
      input_en: "Basket",
      output_en: "POS ticket",
      system_name: "POS",
      pain_en: "Offline queue",
      pain_vi: "Hàng đợi offline",
      req: null,
    },
    {
      id: "ps-pos-3",
      stream: "pos",
      sort_order: 3,
      name_en: "Close and compare declared takings",
      name_vi: "Đóng ca và đối chiếu",
      owner_role: "finance",
      input_en: "Declared cash/card",
      output_en: "Shift close run",
      system_name: "Tillbridge",
      pain_en: "Short till found next day",
      pain_vi: "Thiếu quỹ phát hiện muộn",
      req: "QT-R06",
    },
  ];

  const reqTexts: Record<
    string,
    { en: string; vi: string; acceptance: string; priority: string }
  > = {
    "QT-R01": {
      en: "An order becomes an invoice through draft then issue. VAT is computed in code.",
      vi: "Đơn thành hóa đơn qua soạn rồi phát hành. VAT tính bằng mã.",
      acceptance: "Draft from order uses vat.ts totals.",
      priority: "now",
    },
    "QT-R02": {
      en: "Account, order, invoice, and POS ticket share one SKU list.",
      vi: "Tài khoản, đơn, hóa đơn, vé POS dùng một danh mục SKU.",
      acceptance: "Items table backs all line types.",
      priority: "now",
    },
    "QT-R03": {
      en: "Rules match bank lines. Ambiguous cases wait for finance.",
      vi: "Luật khớp dòng ngân hàng. Trường hợp mơ hồ chờ kế toán.",
      acceptance: "bl-77 stays ambiguous.",
      priority: "now",
    },
    "QT-R04": {
      en: "The model explains a match and never posts it.",
      vi: "Mô hình giải thích khớp, không ghi sổ.",
      acceptance: "Confirm requires finance role.",
      priority: "now",
    },
    "QT-R05": {
      en: "Sales cannot read bank lines or a full tax code.",
      vi: "Sales không đọc dòng ngân hàng hoặc mã số thuế đầy đủ.",
      acceptance: "Sales GET reconcile queue is 403.",
      priority: "now",
    },
    "QT-R06": {
      en: "Closing a shift is idempotent and writes a run log.",
      vi: "Đóng ca idempotent và ghi log chạy.",
      acceptance: "Second close returns same run.",
      priority: "now",
    },
    "QT-R07": {
      en: "A voided invoice remains stored with status void.",
      vi: "Hóa đơn huỷ vẫn lưu với trạng thái void.",
      acceptance: "Void does not delete row.",
      priority: "next",
    },
    "QT-R08": {
      en: "The payload sent to the model is the redacted copy, and that copy is stored.",
      vi: "Payload gửi mô hình là bản redact, và được lưu.",
      acceptance: "Security page shows diff.",
      priority: "now",
    },
  };

  for (const step of steps) {
    const { req, ...stepData } = step;
    await prisma.processStep.create({ data: stepData });
    if (req) {
      const r = reqTexts[req];
      await prisma.requirement.create({
        data: {
          id: req,
          step_id: step.id,
          statement_en: r.en,
          statement_vi: r.vi,
          priority: r.priority,
          acceptance_en: r.acceptance,
        },
      });
    }
  }

  await prisma.requirement.create({
    data: {
      id: "QT-R07",
      step_id: "ps-fin-2",
      statement_en: reqTexts["QT-R07"].en,
      statement_vi: reqTexts["QT-R07"].vi,
      priority: reqTexts["QT-R07"].priority,
      acceptance_en: reqTexts["QT-R07"].acceptance,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
