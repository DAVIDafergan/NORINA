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
    <div className="flex flex-col gap-16 pb-16">
      <section className="flex flex-col items-center gap-4 bg-cream px-4 py-24 text-center">
        <h1 className="font-serif text-4xl tracking-wide md:text-5xl">{t("title")}</h1>
        <p className="max-w-md text-ink/60">{t("subtitle")}</p>
      </section>

      {products.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <h2 className="mb-6 font-serif text-2xl">{t("newArrivals")}</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale as Locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
