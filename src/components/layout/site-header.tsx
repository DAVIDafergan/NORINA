import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveCategories } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountStatus } from "@/components/auth/account-status";
import { CartButton } from "@/components/cart/cart-button";
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
    <header className="relative border-b border-gold/30 bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <MobileNav categories={categoryLinks}>
          <AccountStatus />
        </MobileNav>

        <Link href="/" className="font-serif text-xl tracking-wide">
          {t("siteName")}
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm md:flex">
          {categoryLinks.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="hover:text-gold">
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
          <div className="hidden md:block">
            <AccountStatus />
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
