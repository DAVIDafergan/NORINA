"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export function NewsletterForm() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setStatus(res.ok ? "success" : "error");
    if (res.ok) setEmail("");
  }

  if (status === "success") {
    return <p className="text-sm text-ink/75">{t("newsletterSuccess")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label className="flex-1">
        <span className="sr-only">{t("newsletterPlaceholder")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          className="w-full rounded-sm border border-ink/25 bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none"
        />
      </label>
      <Button type="submit" disabled={status === "loading"} className="shrink-0">
        {t("newsletterButton")}
      </Button>
      {status === "error" && <p className="text-sm text-red-600 sm:basis-full">{t("newsletterError")}</p>}
    </form>
  );
}
