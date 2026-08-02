import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategoryWithProducts } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductCard } from "@/components/catalog/product-card";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) return {};

  const name = getLocalizedText(category.name, locale as Locale);
  return {
    title: name,
    openGraph: { title: name },
    twitter: { title: name },
  };
}

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
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="mb-14 text-center font-serif text-3xl uppercase tracking-[0.1em] md:text-4xl">
        {getLocalizedText(category.name, loc)}
      </h1>
      {category.products.length === 0 ? (
        <p className="text-center text-ink-soft">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 md:gap-x-10 md:gap-y-16">
          {category.products.map((product, index) => (
            <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
              <ProductCard product={product} locale={loc} priority={index < 4} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
