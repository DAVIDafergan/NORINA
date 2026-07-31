import type { Locale } from "@/lib/types";

/**
 * Prices are always in ILS with no currency conversion - see DECISIONS.md
 * (stage 5) for why. Only the number formatting adapts to the locale.
 */
export function formatPrice(amount: number | string, locale: Locale): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ILS",
  }).format(value);
}
