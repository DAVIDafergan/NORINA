"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

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
  const [query, setQuery] = useState("");
  const t = useTranslations("common");
  const tSearch = useTranslations("search");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Rendered via a portal into document.body: the header uses backdrop-blur,
  // which (like `filter`/`transform`) creates a new containing block for
  // `position: fixed` descendants - without the portal, this drawer's
  // "fixed inset-0" would be clipped to the header's own height instead of
  // covering the viewport.
  const drawer = open && (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/40 animate-fade-up"
      />
      <div className="absolute inset-y-0 start-0 flex w-[85vw] max-w-sm flex-col gap-6 overflow-y-auto bg-cream p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-serif text-xl tracking-[0.14em]">{t("siteName")}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירה"
            className="flex h-11 w-11 items-center justify-center text-ink/70 hover:text-gold"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 border-b border-line pb-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tSearch("placeholder")}
            className="w-full bg-transparent text-sm placeholder:text-ink/40 focus:outline-none"
          />
        </form>

        <nav className="flex flex-col gap-1">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-sm px-2 py-3 text-base transition-colors hover:bg-cream-deep"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4">
          {children}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="תפריט"
        aria-expanded={open}
        className="flex h-11 w-11 flex-col items-center justify-center gap-1.5"
      >
        <span className="block h-px w-6 bg-ink" />
        <span className="block h-px w-6 bg-ink" />
        <span className="block h-px w-6 bg-ink" />
      </button>

      {drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}
