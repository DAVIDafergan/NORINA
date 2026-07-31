"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore, useCartHasHydrated } from "@/lib/cart-store";

export function CartButton() {
  const t = useTranslations("cart");
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartHasHydrated();

  const count = hasHydrated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <Link href="/cart" className="relative text-sm font-medium hover:underline">
      {t("title")}
      {count > 0 && (
        <span className="absolute -end-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
