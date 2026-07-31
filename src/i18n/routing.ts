import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he", "fr", "en"],
  defaultLocale: "he",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirections: Record<AppLocale, "rtl" | "ltr"> = {
  he: "rtl",
  fr: "ltr",
  en: "ltr",
};
