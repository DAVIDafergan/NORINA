"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";

export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const tErrors = useTranslations("auth.errors");
  const locale = useLocale() as Locale;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(tErrors("passwordMismatch"));
      return;
    }
    if (password.length < 8) {
      setError(tErrors("weakPassword"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, locale }),
    });
    setLoading(false);

    if (res.status === 409) {
      setError(tErrors("emailInUse"));
      return;
    }
    if (!res.ok) {
      setError(tErrors("genericError"));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return <p className="text-center text-sm text-ink/75">{t("success")}</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="font-serif text-2xl tracking-wide">{t("title")}</h1>

      <Button variant="secondary" onClick={() => signIn("google")} type="button">
        {t("googleButton")}
      </Button>

      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <div className="h-px flex-1 bg-line" />
        {t("or")}
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField label={t("nameLabel")} required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label={t("emailLabel")}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label={t("passwordLabel")}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label={t("confirmPasswordLabel")}
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {t("submit")}
        </Button>
      </form>

      <span className="text-center text-sm">
        {t("haveAccount")}{" "}
        <Link href="/sign-in" className="font-medium text-ink transition-colors hover:text-gold">
          {t("signInLink")}
        </Link>
      </span>
    </div>
  );
}
