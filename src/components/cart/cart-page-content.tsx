"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore, useCartHasHydrated } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export function CartPageContent({ locale }: { locale: Locale }) {
  const t = useTranslations("cart");
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const hasHydrated = useCartHasHydrated();

  if (!hasHydrated) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center animate-fade-up">
        <p className="text-ink-soft">{t("empty")}</p>
        <Link href="/" className="text-sm font-medium text-ink transition-colors hover:text-gold">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 animate-fade-up">
      <h1 className="mb-10 font-serif text-2xl tracking-wide md:text-3xl">{t("title")}</h1>

      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 border-b border-line pb-6">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-cream-deep">
              {item.image && (
                <Image src={item.image} alt={item.productName} fill unoptimized className="object-cover" sizes="80px" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 text-sm">
              <Link href={`/product/${item.productSlug}`} className="font-medium transition-colors hover:text-gold">
                {item.productName}
              </Link>
              <span className="text-ink-soft">
                {item.colorName} &middot; {item.sizeLabel}
              </span>
              <span>{formatPrice(item.unitPrice, locale)}</span>
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="sr-only">{t("quantity")}</span>
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                    className="rounded-sm border border-ink/20 bg-transparent px-2 py-1 focus:border-gold focus:outline-none"
                  >
                    {Array.from({ length: item.maxStock }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-ink-soft underline transition-colors hover:text-gold"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between">
        <span className="font-medium">{t("subtotal")}</span>
        <span className="text-lg font-semibold">{formatPrice(subtotal, locale)}</span>
      </div>

      <Link href="/checkout" className="mt-6 block">
        <Button className="w-full">{t("checkout")}</Button>
      </Link>
    </div>
  );
}
