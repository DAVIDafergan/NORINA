"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

interface CategoryLink {
  slug: string;
  name: string;
}

export function MobileNav({
  categories,
  children,
}: {
  categories: CategoryLink[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="תפריט"
        aria-expanded={open}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span className="block h-0.5 w-6 bg-ink" />
        <span className="block h-0.5 w-6 bg-ink" />
        <span className="block h-0.5 w-6 bg-ink" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-gold/30 bg-cream px-4 py-4 shadow-sm">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="py-3 text-base"
            >
              {category.name}
            </Link>
          ))}
          {children && <div className="mt-2 border-t border-gold/20 pt-3">{children}</div>}
        </div>
      )}
    </div>
  );
}
