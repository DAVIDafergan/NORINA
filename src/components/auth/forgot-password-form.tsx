"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return <p className="text-center text-sm text-ink/75">{t("success")}</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl tracking-wide">{t("title")}</h1>
        <p className="mt-2 text-sm text-ink-soft">{t("description")}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={t("emailLabel")}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
