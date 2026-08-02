"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SizeGuideModal, type SizeGuideEntry } from "@/components/catalog/size-guide-modal";
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
  bustMin: number | null;
  bustMax: number | null;
  waistMin: number | null;
  waistMax: number | null;
  hipsMin: number | null;
  hipsMax: number | null;
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const selectedColor = product.colors.find((c) => c.id === selectedColorId) ?? product.colors[0];

  const sizesForColor = useMemo(
    () =>
      product.variants
        .filter((v) => v.colorId === selectedColorId)
        .sort((a, b) => a.sizeOrder - b.sizeOrder),
    [product.variants, selectedColorId],
  );

  const sizeGuideEntries: SizeGuideEntry[] = useMemo(
    () =>
      sizesForColor.map((v) => ({
        sizeId: v.sizeId,
        label: v.sizeLabel,
        bustMin: v.bustMin,
        bustMax: v.bustMax,
        waistMin: v.waistMin,
        waistMax: v.waistMax,
        hipsMin: v.hipsMin,
        hipsMax: v.hipsMax,
      })),
    [sizesForColor],
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

  const infoSections = [
    { label: t("description"), value: product.description },
    { label: t("materials"), value: product.materials },
    { label: t("careInstructions"), value: product.careInstructions },
    { label: t("additionalInfo"), value: product.additionalInfo },
  ].filter((section) => section.value);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-10 pb-32 md:grid-cols-2 md:gap-14 md:px-6 md:py-16 md:pb-16">
      <div className="flex animate-fade-up flex-col gap-3">
        {(selectedColor?.images ?? []).map((image) => (
          <div key={image.id} className="relative aspect-[4/5] w-full overflow-hidden bg-cream-deep">
            <Image src={image.url} alt={product.name} fill unoptimized className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        ))}
      </div>

      <div className="flex animate-fade-up flex-col gap-7" style={{ animationDelay: "100ms" }}>
        <div>
          <h1 className="font-serif text-3xl tracking-wide md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-lg text-ink-soft">{formatPrice(price, locale)}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-soft">
            {t("color")}
            {selectedColor && <span className="ms-1.5 normal-case tracking-normal text-ink/70">— {selectedColor.name}</span>}
          </p>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleSelectColor(color.id)}
                title={color.name}
                aria-pressed={color.id === selectedColorId}
                className={`h-9 w-9 shrink-0 rounded-full border transition-all ${
                  color.id === selectedColorId
                    ? "border-gold ring-1 ring-gold ring-offset-2 ring-offset-cream"
                    : "border-ink/15 hover:border-gold/60"
                }`}
                style={{ backgroundColor: color.hexCode }}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("size")}</p>
            <button
              type="button"
              onClick={() => setShowSizeGuide(true)}
              className="text-xs text-ink-soft underline transition-colors hover:text-gold"
            >
              {t("sizeGuide")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((variant) => (
              <button
                key={variant.sizeId}
                type="button"
                disabled={variant.stockQuantity === 0}
                onClick={() => setSelectedSizeId(variant.sizeId)}
                className={`min-h-11 min-w-11 rounded-sm border px-3.5 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                  variant.sizeId === selectedSizeId
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 hover:border-ink/50"
                }`}
              >
                {variant.sizeLabel}
              </button>
            ))}
          </div>
          {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= LOW_STOCK_THRESHOLD && (
            <p className="mt-3 text-sm text-rose-deep">{t("onlyLeft", { count: selectedVariant.stockQuantity })}</p>
          )}
        </div>

        <Button type="button" onClick={handleAddToCart} disabled={addToCartDisabled} className="hidden w-full md:block">
          {addToCartLabel}
        </Button>

        {infoSections.length > 0 && (
          <div className="flex flex-col divide-y divide-line border-t border-line">
            {infoSections.map((section) => (
              <div key={section.label} className="py-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-ink-soft">{section.label}</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/75">{section.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky add-to-cart bar for mobile (spec section 6: "sticky add to cart") */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <span className="font-medium">{formatPrice(price, locale)}</span>
        <Button type="button" onClick={handleAddToCart} disabled={addToCartDisabled} className="flex-1">
          {addToCartLabel}
        </Button>
      </div>

      {showSizeGuide && (
        <SizeGuideModal
          sizes={sizeGuideEntries}
          onClose={() => setShowSizeGuide(false)}
          onSelectSize={(sizeId) => {
            setSelectedSizeId(sizeId);
            setShowSizeGuide(false);
          }}
        />
      )}
    </div>
  );
}
