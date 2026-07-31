"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";

export interface ProductDetailColor {
  id: string;
  name: string;
  hexCode: string;
  images: string[];
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
      image: selectedColor.images[0] ?? null,
      unitPrice: selectedVariant.price,
      quantity: 1,
      maxStock: selectedVariant.stockQuantity,
    });
    setJustAdded(true);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="grid grid-cols-2 gap-2">
        {(selectedColor?.images ?? []).map((url) => (
          <div key={url} className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
            <Image src={url} alt={product.name} fill className="object-cover" sizes="50vw" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-lg text-zinc-600">{formatPrice(price, locale)}</p>
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
                className={`h-8 w-8 rounded-full border-2 ${
                  color.id === selectedColorId ? "border-zinc-900" : "border-transparent"
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
                className={`rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  variant.sizeId === selectedSizeId
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300"
                }`}
              >
                {variant.sizeLabel}
              </button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= LOW_STOCK_THRESHOLD && (
            <p className="mt-2 text-sm text-amber-600">{t("onlyLeft", { count: selectedVariant.stockQuantity })}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
          className="rounded bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!selectedSizeId
            ? t("selectSize")
            : justAdded
              ? t("addedToCart")
              : t("addToCart")}
        </button>

        {product.description && (
          <div>
            <p className="mb-1 text-sm font-medium">{t("description")}</p>
            <p className="text-sm text-zinc-600">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
