import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";

function wrap(heading: string, body: string, ctaLabel: string, ctaUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px;">${heading}</h1>
      <p style="color: #444;">${body}</p>
      <a href="${ctaUrl}" style="display:inline-block; margin-top: 16px; padding: 12px 24px; background:#111; color:#fff; text-decoration:none; border-radius: 4px;">${ctaLabel}</a>
    </div>
  `;
}

export async function buildVerifyEmail(locale: Locale, verifyUrl: string) {
  const t = await getTranslations({ locale, namespace: "auth.emails.verify" });
  return {
    subject: t("subject"),
    html: wrap(t("heading"), t("body"), t("cta"), verifyUrl),
  };
}

export async function buildResetPasswordEmail(locale: Locale, resetUrl: string) {
  const t = await getTranslations({ locale, namespace: "auth.emails.reset" });
  return {
    subject: t("subject"),
    html: wrap(t("heading"), t("body"), t("cta"), resetUrl),
  };
}
