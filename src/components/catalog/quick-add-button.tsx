"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cart-store";
import { useToastStore } from "@/lib/toast-store";
import { CartAddIcon } from "@/components/icons";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale, LocalizedText } from "@/lib/types";

interface QuickAddColor {
  id: string;
  name: LocalizedText;
  hexCode: string;
  images: { url: string }[];
}
interface QuickAddVariant {
  variantId: string;
  colorId: string;
  sizeId: string;
  sizeLabel: string;
  sizeOrder: number;
  stockQuantity: number;
}

const POPOVER_WIDTH = 260;

export function QuickAddButton({
  productSlug,
  productName,
  colors,
  variants,
  unitPrice,
  locale,
}: {
  productSlug: string;
  productName: string;
  colors: QuickAddColor[];
  variants: QuickAddVariant[];
  unitPrice: number;
  locale: Locale;
}) {
  const t = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  const hasStock = variants.some((v) => v.stockQuantity > 0);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (popoverRef.current?.contains(event.target as Node) || triggerRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function addVariant(variant: QuickAddVariant, color: QuickAddColor) {
    addItem({
      variantId: variant.variantId,
      productSlug,
      productName,
      colorName: getLocalizedText(color.name, locale),
      hexCode: color.hexCode,
      sizeLabel: variant.sizeLabel,
      image: color.images[0]?.url ?? null,
      unitPrice,
      quantity: 1,
      maxStock: variant.stockQuantity,
    });
    showToast(t("addedToast", { name: productName }));
    setOpen(false);
    setSelectedColorId(null);
    setSelectedSizeId(null);
  }

  function handleTriggerClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!hasStock) return;

    const inStockVariants = variants.filter((v) => v.stockQuantity > 0);
    if (inStockVariants.length === 1) {
      const variant = inStockVariants[0];
      const color = colors.find((c) => c.id === variant.colorId);
      if (color) addVariant(variant, color);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.min(Math.max(8, rect.left - POPOVER_WIDTH + rect.width), window.innerWidth - POPOVER_WIDTH - 8);
      setPosition({ top: rect.bottom + 8, left });
    }
    const defaultColorId = colors.find((c) => variants.some((v) => v.colorId === c.id && v.stockQuantity > 0))?.id;
    setSelectedColorId(defaultColorId ?? colors[0]?.id ?? null);
    setSelectedSizeId(null);
    setOpen(true);
  }

  const sizesForSelectedColor = variants
    .filter((v) => v.colorId === selectedColorId)
    .sort((a, b) => a.sizeOrder - b.sizeOrder);
  const selectedVariant = sizesForSelectedColor.find((v) => v.sizeId === selectedSizeId);
  const selectedColor = colors.find((c) => c.id === selectedColorId);

  if (!hasStock) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        aria-label={t("quickAdd")}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/95 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-ink hover:text-cream"
      >
        <CartAddIcon className="h-5 w-5" />
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
            // Portaled content is still inside the trigger's <Link/> in React's
            // component tree (even though it's rendered elsewhere in the DOM),
            // so clicks here would otherwise bubble up through React's synthetic
            // event system and trigger the card's navigation.
            onClick={(event) => event.stopPropagation()}
            className="fixed z-[150] flex flex-col gap-3 rounded-sm border border-line bg-white p-4 shadow-xl animate-fade-up"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("color")}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-ink/50 hover:text-ink"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    setSelectedColorId(color.id);
                    setSelectedSizeId(null);
                  }}
                  aria-pressed={color.id === selectedColorId}
                  className={`h-8 w-8 shrink-0 rounded-full border transition-all ${
                    color.id === selectedColorId
                      ? "border-gold ring-1 ring-gold ring-offset-2 ring-offset-white"
                      : "border-ink/15 hover:border-gold/60"
                  }`}
                  style={{ backgroundColor: color.hexCode }}
                />
              ))}
            </div>

            <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">{t("size")}</p>
            <div className="flex flex-wrap gap-2">
              {sizesForSelectedColor.map((variant) => (
                <button
                  key={variant.sizeId}
                  type="button"
                  disabled={variant.stockQuantity === 0}
                  onClick={() => setSelectedSizeId(variant.sizeId)}
                  className={`min-h-9 min-w-9 rounded-sm border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    variant.sizeId === selectedSizeId ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink/50"
                  }`}
                >
                  {variant.sizeLabel}
                </button>
              ))}
              {sizesForSelectedColor.length === 0 && <p className="text-sm text-ink-soft">—</p>}
            </div>

            <button
              type="button"
              disabled={!selectedVariant}
              onClick={() => selectedVariant && selectedColor && addVariant(selectedVariant, selectedColor)}
              className="mt-1 min-h-11 w-full rounded-sm bg-ink text-sm text-cream transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("addToCart")}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
