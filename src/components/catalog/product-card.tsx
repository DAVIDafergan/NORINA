import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";

interface ProductCardProduct {
  slug: string;
  name: unknown;
  basePrice: unknown;
  colors: { hexCode: string; images: { url: string }[] }[];
}

export function ProductCard({
  product,
  locale,
}: {
  product: ProductCardProduct;
  locale: Locale;
}) {
  const image = product.colors[0]?.images[0]?.url;
  const name = getLocalizedText(product.name, locale);

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream-deep">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-serif text-base text-ink transition-colors group-hover:text-gold">{name}</span>
        <span className="text-ink-soft">{formatPrice(Number(product.basePrice), locale)}</span>
      </div>
    </Link>
  );
}
