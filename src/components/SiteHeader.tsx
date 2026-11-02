import Link from "next/link";
import { getDemoRole, getLocale } from "@/lib/session";
import { getMessages } from "@/i18n";
import { pickRole, toggleLocale } from "@/app/actions";
import type { DemoRole } from "@/server/policy";

export async function SiteHeader() {
  const role = await getDemoRole();
  const locale = await getLocale();
  const t = await getMessages();
  const roles: DemoRole[] = ["sales", "finance", "leadership"];

  return (
    <header className="border-b border-cocoa/20 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-cocoa/70">{t.kicker}</p>
          <Link href="/" className="font-display text-2xl text-ink">
            {t.wordmark}
          </Link>
        </div>
        <nav className="flex flex-1 flex-wrap gap-3 text-sm">
          {Object.entries(t.nav).map(([key, label]) => (
            <Link key={key} href={key === "home" ? "/" : `/${key}`} className="text-ink/80 hover:text-pandan">
              {label}
            </Link>
          ))}
        </nav>
        <form action={toggleLocale}>
          <button type="submit" className="rounded border border-cocoa/30 px-2 py-1 text-xs">
            {locale === "vi" ? "EN" : "VI"}
          </button>
        </form>
        <div className="flex gap-1">
          {roles.map((r) => (
            <form key={r} action={pickRole}>
              <input type="hidden" name="role" value={r} />
              <button
                type="submit"
                className={`rounded px-2 py-1 text-xs ${role === r ? "bg-pandan text-paper" : "border border-cocoa/30"}`}
              >
                {t.role[r]}
              </button>
            </form>
          ))}
        </div>
      </div>
    </header>
  );
}
