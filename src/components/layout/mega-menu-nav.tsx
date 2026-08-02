"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";

interface PreviewProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  image: string | null;
}
interface CategoryWithPreview {
  id: string;
  slug: string;
  name: string;
  products: PreviewProduct[];
}

export function MegaMenuNav({
  categories,
  viewAllLabel,
  locale,
}: {
  categories: CategoryWithPreview[];
  viewAllLabel: string;
  locale: Locale;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openCategory = categories.find((c) => c.id === openId);

  return (
    <div className="relative" onMouseLeave={() => setOpenId(null)}>
      <nav className="flex items-center gap-7 text-sm tracking-wide">
        {categories.map((category) => (
          <div key={category.id} onMouseEnter={() => setOpenId(category.id)} onFocus={() => setOpenId(category.id)}>
            <Link
              href={`/category/${category.slug}`}
              className={`text-ink/75 transition-colors hover:text-gold ${openId === category.id ? "text-gold" : ""}`}
            >
              {category.name}
            </Link>
          </div>
        ))}
      </nav>

      {openCategory && (
        <div className="absolute start-1/2 top-full z-30 mt-4 w-screen max-w-3xl -translate-x-1/2 animate-fade-up border border-line bg-cream p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="font-serif text-lg">{openCategory.name}</span>
            <Link href={`/category/${openCategory.slug}`} className="text-xs uppercase tracking-widest text-gold hover:underline">
              {viewAllLabel}
            </Link>
          </div>
          {openCategory.products.length > 0 ? (
            <div className="mt-6 grid grid-cols-3 gap-6">
              {openCategory.products.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream-deep">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="200px"
                      />
                    ) : (
                      <PlaceholderImage className="absolute inset-0" />
                    )}
                  </div>
                  <span className="truncate text-sm text-ink/80 group-hover:text-gold">{product.name}</span>
                  <span className="text-xs text-ink-soft">{formatPrice(product.basePrice, locale)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-soft">עדיין אין מוצרים בקטגוריה הזו.</p>
          )}
        </div>
      )}
    </div>
  );
}
