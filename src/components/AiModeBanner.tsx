import { aiHealth } from "@/lib/ai/client";
import { getMessages } from "@/i18n";

export async function AiModeBanner() {
  const health = aiHealth();
  if (health === "configured") return null;
  const t = await getMessages();
  return (
    <div className="bg-caramel/20 px-4 py-2 text-center text-sm text-ink">
      {t.demoBanner}
    </div>
  );
}
