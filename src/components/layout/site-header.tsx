import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoriesWithPreview } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountStatus } from "@/components/auth/account-status";
import { CartButton } from "@/components/cart/cart-button";
import { SearchBox } from "@/components/layout/search-box";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MegaMenuNav } from "@/components/layout/mega-menu-nav";

export async function SiteHeader() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const [categories, shippingSetting] = await Promise.all([
    getCategoriesWithPreview(),
    prisma.shippingSetting.findFirst(),
  ]);

  const categoryLinks = categories.map((category) => ({
    slug: category.slug,
    name: getLocalizedText(category.name, locale),
  }));
  const categoriesWithPreview = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: getLocalizedText(category.name, locale),
    products: category.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: getLocalizedText(product.name, locale),
      basePrice: Number(product.basePrice),
      image: product.colors[0]?.images[0]?.url ?? null,
    })),
  }));

  const announcement =
    shippingSetting?.freeShippingAbove != null
      ? t("freeShippingAnnouncement", { amount: formatPrice(Number(shippingSetting.freeShippingAbove), locale) })
      : t("announcementFallback");

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm">
      <div className="border-b border-line/60 bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6 px-4 py-2 text-xs sm:justify-between md:px-6">
          <span>{announcement}</span>
          <div className="hidden items-center gap-4 sm:flex">
            <LanguageSwitcher variant="inverted" />
            <AccountStatus variant="inverted" />
          </div>
        </div>
      </div>

      <div className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
          <div className="flex items-center gap-6">
            <MobileNav categories={categoryLinks}>
              <AccountStatus />
            </MobileNav>
            <div className="hidden md:block">
              <MegaMenuNav categories={categoriesWithPreview} viewAllLabel={t("viewAllCategory")} locale={locale} />
            </div>
          </div>

          <Link href="/" className="justify-self-center font-serif text-2xl tracking-[0.14em] text-ink">
            {t("siteName")}
          </Link>

          <div className="flex items-center justify-end gap-1">
            <div className="hidden md:block">
              <SearchBox />
            </div>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
