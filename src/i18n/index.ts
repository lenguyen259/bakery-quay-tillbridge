import { getLocale } from "@/lib/session";
import { en } from "@/i18n/en";
import { vi } from "@/i18n/vi";

export async function getMessages() {
  const locale = await getLocale();
  return locale === "en" ? en : vi;
}

export async function getLocaleTag() {
  return getLocale();
}
