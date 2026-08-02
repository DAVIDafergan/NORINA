"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const tErrors = useTranslations("auth.errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(tErrors("invalidCredentials"));
      return;
    }
    router.push("/");
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {t("submit")}
        </Button>
      </form>

      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-ink-soft transition-colors hover:text-gold">
          {t("forgotPasswordLink")}
        </Link>
        <span>
          {t("noAccount")}{" "}
          <Link href="/sign-up" className="font-medium text-ink transition-colors hover:text-gold">
            {t("signUpLink")}
          </Link>
        </span>
      </div>
    </div>
  );
}
