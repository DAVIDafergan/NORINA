"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("auth.errors");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token || !email) {
    return <p className="text-center text-sm text-red-600">{t("invalidToken")}</p>;
  }

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
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    setLoading(false);

    if (!res.ok) {
      setError(t("invalidToken"));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-sm">
        <p>{t("success")}</p>
        <Link href="/sign-in" className="font-medium text-ink transition-colors hover:text-gold">
          {t("title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="font-serif text-2xl tracking-wide">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
    </div>
  );
}
