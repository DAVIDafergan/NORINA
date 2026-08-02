import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import type { Locale } from "@/lib/types";

interface CategoryTile {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export function CategoryTileGrid({ categories, locale }: { categories: CategoryTile[]; locale: Locale }) {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:px-6 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group relative aspect-[3/4] w-[72vw] shrink-0 snap-start overflow-hidden sm:w-[45vw] md:w-auto"
        >
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              unoptimized
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 768px) 25vw, 70vw"
            />
          ) : (
            <PlaceholderImage locale={locale} tone={index} className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5 text-center text-sm uppercase tracking-[0.2em] text-cream">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
