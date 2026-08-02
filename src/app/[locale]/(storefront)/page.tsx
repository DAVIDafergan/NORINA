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
      <section className="relative flex flex-col items-center gap-5 overflow-hidden bg-linear-to-b from-rose/25 via-cream to-cream px-4 py-28 text-center md:py-40">
        <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.35em] text-gold">NORINA</p>
        <h1 className="animate-fade-up font-serif text-4xl tracking-wide text-ink md:text-6xl" style={{ animationDelay: "80ms" }}>
          {t("title")}
        </h1>
        <p className="animate-fade-up max-w-md text-ink-soft" style={{ animationDelay: "160ms" }}>
          {t("subtitle")}
        </p>
      </section>

      {products.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 md:px-6">
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
