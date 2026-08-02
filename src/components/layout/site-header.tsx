import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveCategories } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountStatus } from "@/components/auth/account-status";
import { CartButton } from "@/components/cart/cart-button";
import { SearchBox } from "@/components/layout/search-box";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const categories = await getActiveCategories();
  const categoryLinks = categories.map((category) => ({
    slug: category.slug,
    name: getLocalizedText(category.name, locale),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
        <div className="flex items-center gap-6">
          <MobileNav categories={categoryLinks}>
            <AccountStatus />
          </MobileNav>
          <nav className="hidden items-center gap-7 text-sm tracking-wide md:flex">
            {categoryLinks.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-ink/75 transition-colors hover:text-gold"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          className="justify-self-center font-serif text-2xl tracking-[0.14em] text-ink"
        >
          {t("siteName")}
        </Link>

        <div className="flex items-center justify-end gap-1">
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <div className="hidden md:block">
            <AccountStatus compact />
          </div>
          <CartButton />
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
