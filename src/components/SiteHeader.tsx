import Link from "next/link";
import { getDemoRole, getLocale } from "@/lib/session";
import { getMessages } from "@/i18n";
import { pickRole, toggleLocale } from "@/app/actions";
import type { DemoRole } from "@/server/policy";

const navKeys = [
  "home",
  "crm",
  "invoices",
  "pos",
  "reconcile",
  "automations",
  "security",
  "process",
  "trust",
] as const;

export async function SiteHeader() {
  const role = await getDemoRole();
  const locale = await getLocale();
  const t = await getMessages();
  const roles: DemoRole[] = ["sales", "finance", "leadership"];

  return (
    <header className="border-b border-cocoa/10 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-cocoa/60">
              {t.kicker}
            </p>
            <Link href="/" className="font-display text-2xl leading-tight text-ink">
              {t.wordmark}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form action={toggleLocale}>
              <button
                type="submit"
                className="rounded-md border border-cocoa/15 bg-white/50 px-3 py-1.5 text-sm text-ink/80"
              >
                {locale === "vi" ? "EN" : "VI"}
              </button>
            </form>
            <div className="inline-flex rounded-lg border border-cocoa/15 bg-white/40 p-0.5">
              {roles.map((r) => (
                <form key={r} action={pickRole}>
                  <input type="hidden" name="role" value={r} />
                  <button
                    type="submit"
                    className={`rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
                      role === r
                        ? "bg-pandan text-paper shadow-sm"
                        : "text-ink/75 hover:bg-paper"
                    }`}
                  >
                    {t.role[r]}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
        <nav className="mt-3 flex gap-3 overflow-x-auto border-t border-cocoa/10 pt-3 text-sm">
          {navKeys.map((key) => (
            <Link
              key={key}
              href={key === "home" ? "/" : `/${key}`}
              className="shrink-0 border-b-2 border-transparent pb-1 text-ink/75 hover:border-cocoa/20 hover:text-ink"
            >
              {t.nav[key]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
