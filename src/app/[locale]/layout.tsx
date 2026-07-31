import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import { routing, localeDirections, type AppLocale } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import "../globals.css";

const bodyFont = Assistant({
  variable: "--font-body",
  subsets: ["latin", "hebrew"],
});

const headingFont = Frank_Ruhl_Libre({
  variable: "--font-heading",
  subsets: ["latin", "hebrew"],
  weight: ["500", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title"),
    description: "NORINA - Women's fashion e-commerce",
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
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
