"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore, useCartHasHydrated } from "@/lib/cart-store";
import { BagIcon } from "@/components/icons";

export function CartButton() {
  const t = useTranslations("cart");
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartHasHydrated();

  const count = hasHydrated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <Link
      href="/cart"
      aria-label={t("title")}
      className="relative flex h-10 w-10 items-center justify-center text-ink/80 transition-colors hover:text-gold"
    >
      <BagIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
