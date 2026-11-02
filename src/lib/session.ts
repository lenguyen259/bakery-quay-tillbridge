import type { DemoRole } from "@/server/policy";

const ROLE_COOKIE = "demo_role";
const LOCALE_COOKIE = "locale";

export async function getDemoRole(): Promise<DemoRole> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const value = store.get(ROLE_COOKIE)?.value;
  if (value === "finance" || value === "leadership") return value;
  return "sales";
}

export async function getLocale(): Promise<"vi" | "en"> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "vi";
}

export { ROLE_COOKIE, LOCALE_COOKIE };
