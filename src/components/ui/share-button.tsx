"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShareIcon } from "@/components/icons";

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const t = useTranslations("product");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Cancelled by the user - not an error.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={handleShare}
        aria-label={t("share")}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-gold hover:text-gold"
      >
        <ShareIcon className="h-5 w-5" />
      </button>
      {copied && (
        <span className="absolute end-0 top-full mt-2 whitespace-nowrap rounded-sm bg-ink px-2.5 py-1 text-xs text-cream">
          {t("linkCopied")}
        </span>
      )}
    </div>
  );
}
