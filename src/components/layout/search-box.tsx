"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { SearchIcon, CloseIcon } from "@/components/icons";

export function SearchBox() {
  const t = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("submit")}
        className="flex h-10 w-10 items-center justify-center text-ink/80 transition-colors hover:text-gold"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-fade-up">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="w-36 border-b border-ink/30 bg-transparent px-1 py-1 text-sm placeholder:text-ink/40 focus:border-gold focus:outline-none sm:w-56"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={t("submit")}
        className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-gold"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
