import type { Locale, LocalizedText } from "@/lib/types";

/** Reads a Prisma `Json` i18n field ({he, fr, en}) for the given locale, falling back to Hebrew. */
export function getLocalizedText(value: unknown, locale: Locale): string {
  const text = value as Partial<LocalizedText> | null | undefined;
  return text?.[locale] ?? text?.he ?? "";
}
