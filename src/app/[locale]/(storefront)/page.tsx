import { getTranslations, setRequestLocale } from "next-intl/server";
import { getNewArrivals } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import type { Locale } from "@/lib/types";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const products = await getNewArrivals();

  return (
    <div className="flex flex-col gap-20 pb-20 md:gap-28 md:pb-28">
      <section className="animate-hero-gradient relative flex min-h-[64vh] items-center justify-center overflow-hidden md:min-h-[75vh]">
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 text-center">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.35em] text-gold">
            {t("heroEyebrow")}
          </p>
          <h1
            className="animate-fade-up font-serif text-4xl tracking-wide text-ink md:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            {t("heroHeadline")}
          </h1>
          <p
            className="animate-fade-up max-w-md text-ink/70 md:text-lg"
            style={{ animationDelay: "260ms" }}
          >
            {t("heroSubheadline")}
          </p>
          <a
            href="#new-arrivals"
            className="animate-fade-up mt-3 min-h-11 rounded-sm border border-ink/40 px-7 py-3 text-sm font-medium tracking-wide text-ink transition-colors hover:border-gold hover:bg-ink hover:text-cream"
            style={{ animationDelay: "400ms" }}
          >
            {t("heroCta")}
          </a>
        </div>
      </section>

      {products.length > 0 && (
        <section id="new-arrivals" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:px-6">
          <h2 className="mb-10 text-center font-serif text-2xl tracking-wide md:text-3xl">{t("newArrivals")}</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {products.map((product, index) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                <ProductCard product={product} locale={locale as Locale} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
