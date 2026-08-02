import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getLocalizedText } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";

interface EditorialProduct {
  id: string;
  slug: string;
  name: unknown;
  colors: { images: { url: string }[] }[];
}

export function EditorialBlocks({
  products,
  locale,
  cta,
}: {
  products: EditorialProduct[];
  locale: Locale;
  cta: string;
}) {
  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2 md:px-6">
      {products.map((product, index) => {
        const image = product.colors[0]?.images[0]?.url ?? null;
        const name = getLocalizedText(product.name, locale);
        return (
          <Link key={product.id} href={`/product/${product.slug}`} className="group flex flex-col gap-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  unoptimized
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <PlaceholderImage locale={locale} tone={index} className="absolute inset-0" />
              )}
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="font-serif text-lg text-ink group-hover:text-gold">{name}</span>
              <span className="text-xs uppercase tracking-widest text-ink-soft group-hover:text-gold">{cta}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
