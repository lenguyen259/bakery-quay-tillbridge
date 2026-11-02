import { getMessages } from "@/i18n";

export async function DisclaimerFooter() {
  const t = await getMessages();
  return (
    <footer className="mt-auto border-t border-cocoa/20 bg-paper px-4 py-6 text-sm text-ink/70">
      <p className="mx-auto max-w-6xl">{t.disclaimer}</p>
    </footer>
  );
}
