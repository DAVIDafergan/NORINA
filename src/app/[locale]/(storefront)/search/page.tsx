import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import type { Locale } from "@/lib/types";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("search");

  const query = q?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h1 className="font-serif text-3xl">{t("title")}</h1>
      {query && <p className="mt-2 text-ink-soft">{t("resultsFor", { query })}</p>}

      {query && products.length === 0 ? (
        <p className="mt-10 text-ink-soft">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {products.map((product, index) => (
            <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
              <ProductCard product={product} locale={loc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
