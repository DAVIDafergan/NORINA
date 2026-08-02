import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getActiveCategories } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const tHome = await getTranslations("home");
  const tCart = await getTranslations("cart");
  const tSignIn = await getTranslations("auth.signIn");
  const categories = await getActiveCategories();

  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 md:px-6">
        <div className="flex flex-col gap-3 sm:col-span-1">
          <span className="font-serif text-xl tracking-[0.14em]">{t("siteName")}</span>
          <p className="max-w-52 text-sm text-ink-soft">{tHome("subtitle")}</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-widest text-ink-soft">{tHome("newArrivals")}</span>
            <nav className="flex flex-col gap-2 text-sm">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-ink/75 transition-colors hover:text-gold"
                >
                  {getLocalizedText(category.name, locale)}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-widest text-ink-soft">{tCart("title")}</span>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/cart" className="text-ink/75 transition-colors hover:text-gold">
              {tCart("title")}
            </Link>
            <Link href="/sign-in" className="text-ink/75 transition-colors hover:text-gold">
              {tSignIn("title")}
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-line px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 text-xs text-ink-soft sm:flex-row sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {t("siteName")}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
