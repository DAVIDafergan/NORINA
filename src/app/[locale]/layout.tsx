import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Assistant, Frank_Ruhl_Libre, Playfair_Display } from "next/font/google";
import { routing, localeDirections, type AppLocale } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import "../globals.css";

const bodyFont = Assistant({
  variable: "--font-body",
  subsets: ["latin", "hebrew"],
});

// Two heading fonts, switched by html[lang] in globals.css: Playfair Display
// has no Hebrew glyphs at all, so Hebrew keeps Frank Ruhl Libre (an
// equally editorial, high-contrast serif with full Hebrew coverage) while
// French/English get genuine Playfair Display.
const headingFontHe = Frank_Ruhl_Libre({
  variable: "--font-heading-he",
  subsets: ["latin", "hebrew"],
  weight: ["500", "700"],
});

const headingFontLatin = Playfair_Display({
  variable: "--font-heading-latin",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// NEXTAUTH_URL is already the deployed origin (required by next-auth in
// production) - reused here instead of adding a second "site URL" env var.
const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const OG_LOCALES: Record<string, string> = { he: "he_IL", fr: "fr_FR", en: "en_US" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const description = "NORINA - Women's fashion e-commerce";
  return {
    metadataBase: new URL(siteUrl),
    title: { template: "%s | NORINA", default: t("title") },
    description,
    openGraph: {
      siteName: "NORINA",
      type: "website",
      locale: OG_LOCALES[locale] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale (see next-intl docs on setRequestLocale)
  setRequestLocale(locale);

  const dir = localeDirections[locale as AppLocale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${bodyFont.variable} ${headingFontHe.variable} ${headingFontLatin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
