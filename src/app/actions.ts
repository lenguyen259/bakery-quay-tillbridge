"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, ROLE_COOKIE } from "@/lib/session";
import { writeAudit } from "@/server/reconcile";
import type { DemoRole } from "@/server/policy";

export async function setDemoRole(role: DemoRole) {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/" });
  try {
    await writeAudit(role, "session.role", "session", role, { role });
  } catch {
    /* db optional during static build */
  }
}

export async function pickRole(formData: FormData) {
  const role = formData.get("role") as DemoRole;
  if (role === "sales" || role === "finance" || role === "leadership") {
    await setDemoRole(role);
  }
}

export async function toggleLocale() {
  const store = await cookies();
  const current = store.get(LOCALE_COOKIE)?.value;
  const next = current === "en" ? "vi" : "en";
  store.set(LOCALE_COOKIE, next, { httpOnly: true, sameSite: "lax", path: "/" });
}
