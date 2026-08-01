"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export interface ProductDetailColor {
  id: string;
  name: string;
  hexCode: string;
  images: { id: string; url: string }[];
}

export interface ProductDetailVariant {
  variantId: string;
  colorId: string;
  sizeId: string;
  sizeLabel: string;
  sizeOrder: number;
  stockQuantity: number;
  price: number;
}

export interface ProductDetailData {
  id: string;
  slug: string;
  name: string;
  description: string;
  materials: string;
  careInstructions: string;
  additionalInfo: string;
  colors: ProductDetailColor[];
  variants: ProductDetailVariant[];
}

const LOW_STOCK_THRESHOLD = 3;

export function ProductDetail({ product, locale }: { product: ProductDetailData; locale: Locale }) {
  const t = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColorId, setSelectedColorId] = useState(product.colors[0]?.id);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const selectedColor = product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];

  const sizesForColor = useMemo(
    () =>
      product.variants
        .filter((v) => v.colorId === selectedColorId)
        .sort((a, b) => a.sizeOrder - b.sizeOrder),
    [product.variants, selectedColorId],
  );

  const selectedVariant = sizesForColor.find((v) => v.sizeId === selectedSizeId);
  const price = selectedVariant?.price ?? sizesForColor[0]?.price ?? 0;

  function handleSelectColor(colorId: string) {
    setSelectedColorId(colorId);
    setSelectedSizeId(null);
    setJustAdded(false);
  }

  function handleAddToCart() {
    if (!selectedVariant || !selectedColor) return;
    addItem({
      variantId: selectedVariant.variantId,
      productSlug: product.slug,
      productName: product.name,
      colorName: selectedColor.name,
      hexCode: selectedColor.hexCode,
      sizeLabel: selectedVariant.sizeLabel,
      image: selectedColor.images[0]?.url ?? null,
      unitPrice: selectedVariant.price,
      quantity: 1,
      maxStock: selectedVariant.stockQuantity,
    });
    setJustAdded(true);
  }

  const addToCartLabel = !selectedSizeId ? t("selectSize") : justAdded ? t("addedToCart") : t("addToCart");
  const addToCartDisabled = !selectedVariant || selectedVariant.stockQuantity === 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 pb-28 md:grid-cols-2 md:pb-12">
      <div className="grid grid-cols-2 gap-2">
        {(selectedColor?.images ?? []).map((image) => (
          <div key={image.id} className="relative aspect-[3/4] overflow-hidden bg-cream">
            <Image src={image.url} alt={product.name} fill unoptimized className="object-cover" sizes="50vw" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-3xl">{product.name}</h1>
          <p className="mt-1 text-lg text-ink/70">{formatPrice(price, locale)}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t("color")}</p>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleSelectColor(color.id)}
                title={color.name}
                aria-pressed={color.id === selectedColorId}
                className={`h-9 w-9 rounded-full border-2 ${
                  color.id === selectedColorId ? "border-gold" : "border-transparent"
                }`}
                style={{ backgroundColor: color.hexCode }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t("size")}</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((variant) => (
              <button
                key={variant.sizeId}
                type="button"
                disabled={variant.stockQuantity === 0}
                onClick={() => setSelectedSizeId(variant.sizeId)}
                className={`min-h-11 min-w-11 rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  variant.sizeId === selectedSizeId ? "border-ink bg-ink text-cream" : "border-ink/20"
                }`}
              >
                {variant.sizeLabel}
              </button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= LOW_STOCK_THRESHOLD && (
            <p className="mt-2 text-sm text-amber-700">{t("onlyLeft", { count: selectedVariant.stockQuantity })}</p>
          )}
        </div>

        <Button type="button" onClick={handleAddToCart} disabled={addToCartDisabled} className="hidden w-full md:block">
          {addToCartLabel}
        </Button>

        {product.description && (
          <div>
            <p className="mb-1 text-sm font-medium">{t("description")}</p>
            <p className="whitespace-pre-line text-sm text-ink/70">{product.description}</p>
          </div>
        )}

        {product.materials && (
          <div>
            <p className="mb-1 text-sm font-medium">{t("materials")}</p>
            <p className="whitespace-pre-line text-sm text-ink/70">{product.materials}</p>
          </div>
        )}

        {product.careInstructions && (
          <div>
            <p className="mb-1 text-sm font-medium">{t("careInstructions")}</p>
            <p className="whitespace-pre-line text-sm text-ink/70">{product.careInstructions}</p>
          </div>
        )}

        {product.additionalInfo && (
          <div>
            <p className="mb-1 text-sm font-medium">{t("additionalInfo")}</p>
            <p className="whitespace-pre-line text-sm text-ink/70">{product.additionalInfo}</p>
          </div>
        )}
      </div>

      {/* Sticky add-to-cart bar for mobile (spec section 6: "sticky add to cart") */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gold/30 bg-cream px-4 py-3 md:hidden">
        <span className="font-medium">{formatPrice(price, locale)}</span>
        <Button type="button" onClick={handleAddToCart} disabled={addToCartDisabled} className="flex-1">
          {addToCartLabel}
        </Button>
      </div>
    </div>
  );
}
