export type DemoRole = "sales" | "finance" | "leadership";

export function assertRole(
  role: DemoRole | null | undefined,
  allowed: DemoRole[],
): { ok: true } | { ok: false; code: string } {
  if (!role || !allowed.includes(role)) {
    return { ok: false, code: "FORBIDDEN" };
  }
  return { ok: true };
}

export function canReadBankQueue(role: DemoRole): boolean {
  return role === "finance";
}

export function canReadReconcileSummary(role: DemoRole): boolean {
  return role === "finance" || role === "leadership";
}

export function canConfirmReconcile(role: DemoRole): boolean {
  return role === "finance";
}

export function canMutateInvoice(role: DemoRole): boolean {
  return role === "finance";
}

export function canCreateOrder(role: DemoRole): boolean {
  return role === "sales" || role === "finance";
}

export function canCloseShift(role: DemoRole): boolean {
  return role === "finance";
}

export function canReadAudit(role: DemoRole): boolean {
  return role === "finance" || role === "leadership";
}

export function canReadFullPii(role: DemoRole): boolean {
  return role === "finance";
}

export function canLeadershipConfirm(_role: DemoRole): boolean {
  return false;
}
