import { getTranslations, setRequestLocale } from "next-intl/server";
import { getNewArrivals, getCategoriesWithPreview } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import { prisma } from "@/lib/prisma";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { CategoryTileGrid } from "@/components/catalog/category-tile-grid";
import { EditorialBlocks } from "@/components/catalog/editorial-blocks";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { Locale, LocalizedText } from "@/lib/types";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const loc = locale as Locale;
  const [editorialProducts, categories, heroSetting] = await Promise.all([
    getNewArrivals(4),
    getCategoriesWithPreview(1),
    prisma.homepageSetting.findFirst(),
  ]);

  const hero = heroSetting?.heroDesktopMediaId
    ? {
        mediaType: heroSetting.heroMediaType,
        desktopUrl: `/api/media/${heroSetting.heroDesktopMediaId}`,
        mobileUrl: heroSetting.heroMobileMediaId ? `/api/media/${heroSetting.heroMobileMediaId}` : null,
        eyebrow: getLocalizedText(heroSetting.heroEyebrow as LocalizedText, loc),
        headline: getLocalizedText(heroSetting.heroHeadline as LocalizedText, loc),
        subheadline: getLocalizedText(heroSetting.heroSubheadline as LocalizedText, loc),
      }
    : null;

  const categoryTiles = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: getLocalizedText(category.name, loc),
    image: category.products[0]?.colors[0]?.images[0]?.url ?? null,
  }));

  return (
    <div className="flex flex-col gap-20 pb-20 md:gap-28 md:pb-28">
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden md:min-h-[85vh]">
        {hero ? (
          hero.mediaType === "VIDEO" ? (
            <video
              src={hero.desktopUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <picture className="absolute inset-0 block h-full w-full">
              {hero.mobileUrl && <source media="(max-width: 767px)" srcSet={hero.mobileUrl} />}
              <img src={hero.desktopUrl} alt="" className="h-full w-full object-cover" />
            </picture>
          )
        ) : (
          <PlaceholderImage locale={loc} className="animate-hero-gradient absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-ink/10" />

        <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.35em] text-gold">
            {hero?.eyebrow ?? t("heroEyebrow")}
          </p>
          <h1
            className="animate-fade-up font-serif text-5xl uppercase tracking-[0.06em] text-ink md:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            {hero?.headline ?? t("heroHeadline")}
          </h1>
          <p className="animate-fade-up max-w-md text-ink/70 md:text-lg" style={{ animationDelay: "260ms" }}>
            {hero?.subheadline ?? t("heroSubheadline")}
          </p>
          <a
            href="#shop"
            className="animate-fade-up mt-3 min-h-11 rounded-sm border border-ink/40 px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:bg-ink hover:text-cream"
            style={{ animationDelay: "400ms" }}
          >
            {t("heroCta")}
          </a>
        </div>
      </section>

      {categoryTiles.length > 0 && (
        <section id="shop" className="scroll-mt-24">
          <h2 className="mb-8 px-4 text-center text-xs font-medium uppercase tracking-[0.3em] text-ink-soft md:px-6">
            {t("shopByCategory")}
          </h2>
          <CategoryTileGrid categories={categoryTiles} locale={loc} />
        </section>
      )}

      {editorialProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl">
          <h2 className="mb-10 px-4 text-center font-serif text-2xl tracking-wide md:px-6 md:text-3xl">
            {t("editorialTitle")}
          </h2>
          <EditorialBlocks products={editorialProducts} locale={loc} cta={t("editorialCta")} />
        </section>
      )}

      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 text-center md:px-6">
        <h2 className="font-serif text-2xl tracking-wide md:text-3xl">{t("newsletterTitle")}</h2>
        <p className="max-w-md text-sm text-ink-soft">{t("newsletterSubtitle")}</p>
        <NewsletterForm />
      </section>
    </div>
  );
}
