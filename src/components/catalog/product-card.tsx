import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { QuickAddButton } from "@/components/catalog/quick-add-button";
import type { Locale, LocalizedText } from "@/lib/types";

interface ProductCardProduct {
  slug: string;
  name: unknown;
  basePrice: unknown;
  colors: { id: string; name: unknown; hexCode: string; images: { url: string }[] }[];
  variants?: { id: string; colorId: string; sizeId: string; stockQuantity: number; size: { label: string; orderIndex: number } }[];
}

export function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: ProductCardProduct;
  locale: Locale;
  /** Set for the first row of cards so they load eagerly (better LCP) instead of lazily. */
  priority?: boolean;
}) {
  const image = product.colors[0]?.images[0]?.url;
  const name = getLocalizedText(product.name, locale);

  return (
    <div className="group flex flex-col gap-3">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-cream-deep">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : (
          <PlaceholderImage locale={locale} className="absolute inset-0" />
        )}
        {product.variants && (
          <div className="absolute bottom-3 end-3">
            <QuickAddButton
              productSlug={product.slug}
              productName={name}
              locale={locale}
              unitPrice={Number(product.basePrice)}
              colors={product.colors.map((color) => ({
                id: color.id,
                name: color.name as LocalizedText,
                hexCode: color.hexCode,
                images: color.images,
              }))}
              variants={product.variants.map((variant) => ({
                variantId: variant.id,
                colorId: variant.colorId,
                sizeId: variant.sizeId,
                sizeLabel: variant.size.label,
                sizeOrder: variant.size.orderIndex,
                stockQuantity: variant.stockQuantity,
              }))}
            />
          </div>
        )}
      </Link>
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-1 text-sm">
        <span className="font-serif text-base text-ink transition-colors group-hover:text-gold">{name}</span>
        <span className="text-ink-soft">{formatPrice(Number(product.basePrice), locale)}</span>
      </Link>
    </div>
  );
}
