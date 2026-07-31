import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveCategories } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountStatus } from "@/components/auth/account-status";
import { CartButton } from "@/components/cart/cart-button";

export async function SiteHeader() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const categories = await getActiveCategories();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          {t("siteName")}
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="hover:underline"
            >
              {getLocalizedText(category.name, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
          <AccountStatus />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
