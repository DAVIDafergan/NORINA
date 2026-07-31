import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategoryWithProducts } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductCard } from "@/components/catalog/product-card";
import type { Locale } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = await getCategoryWithProducts(slug);
  if (!category) notFound();

  const loc = locale as Locale;
  const t = await getTranslations("category");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold">{getLocalizedText(category.name, loc)}</h1>
      {category.products.length === 0 ? (
        <p className="text-zinc-500">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} locale={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
