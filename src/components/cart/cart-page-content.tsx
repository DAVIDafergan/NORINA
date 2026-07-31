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
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-zinc-500">{t("empty")}</p>
        <Link href="/" className="font-medium hover:underline">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold">{t("title")}</h1>

      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 border-b border-zinc-200 pb-6">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-zinc-100">
              {item.image && (
                <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="80px" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 text-sm">
              <Link href={`/product/${item.productSlug}`} className="font-medium hover:underline">
                {item.productName}
              </Link>
              <span className="text-zinc-500">
                {item.colorName} &middot; {item.sizeLabel}
              </span>
              <span>{formatPrice(item.unitPrice, locale)}</span>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="sr-only">{t("quantity")}</span>
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                    className="rounded border border-zinc-300 px-2 py-1"
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
                  className="text-zinc-500 underline hover:text-zinc-900"
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
