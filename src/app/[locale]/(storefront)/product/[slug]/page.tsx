import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProductBySlug } from "@/lib/catalog";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductDetail, type ProductDetailData } from "@/components/catalog/product-detail";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const loc = locale as Locale;
  const name = getLocalizedText(product.name, loc);
  const description = getLocalizedText(product.description, loc);
  const primaryImage =
    product.colors[0]?.images.find((image) => image.isPrimary) ?? product.colors[0]?.images[0] ?? null;
  const imageUrl = primaryImage ? `/api/product-image/${primaryImage.id}` : undefined;
  const price = Number(product.basePrice).toFixed(2);

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 1500, alt: name }] : undefined,
    },
    twitter: {
      title: name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    // og:price isn't a real Open Graph property - product:price:* under
    // og:type=product is the actual convention Facebook/WhatsApp read.
    other: {
      "product:price:amount": price,
      "product:price:currency": "ILS",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const loc = locale as Locale;

  const data: ProductDetailData = {
    id: product.id,
    slug: product.slug,
    name: getLocalizedText(product.name, loc),
    description: getLocalizedText(product.description, loc),
    materials: getLocalizedText(product.materials, loc),
    careInstructions: getLocalizedText(product.careInstructions, loc),
    additionalInfo: getLocalizedText(product.additionalInfo, loc),
    colors: product.colors.map((color) => ({
      id: color.id,
      name: getLocalizedText(color.name, loc),
      hexCode: color.hexCode,
      images: color.images.map((image) => ({ id: image.id, url: image.url })),
    })),
    variants: product.variants.map((variant) => ({
      variantId: variant.id,
      colorId: variant.colorId,
      sizeId: variant.sizeId,
      sizeLabel: variant.size.label,
      sizeOrder: variant.size.orderIndex,
      stockQuantity: variant.stockQuantity,
      price: Number(variant.priceOverride ?? product.basePrice),
      bustMin: variant.size.bustMin,
      bustMax: variant.size.bustMax,
      waistMin: variant.size.waistMin,
      waistMax: variant.size.waistMax,
      hipsMin: variant.size.hipsMin,
      hipsMax: variant.size.hipsMax,
    })),
  };

  return <ProductDetail product={data} locale={loc} />;
}
