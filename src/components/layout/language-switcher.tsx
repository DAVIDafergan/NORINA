"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { ChevronDownIcon } from "@/components/icons";

export function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "inverted" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function select(next: AppLocale) {
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        className={`flex items-center gap-1 text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold ${
          variant === "inverted" ? "text-cream/80" : "text-ink/70"
        }`}
      >
        {locale}
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-30 mt-3 min-w-32 overflow-hidden rounded-sm border border-line bg-cream shadow-lg animate-fade-up">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => select(loc)}
              className={`block w-full px-4 py-2.5 text-start text-sm transition-colors hover:bg-cream-deep ${
                loc === locale ? "font-medium text-gold" : "text-ink/80"
              }`}
            >
              {t(`locale.${loc}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
