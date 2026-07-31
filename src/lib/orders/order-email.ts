import { getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";

export async function buildOrderConfirmationEmail(
  locale: Locale,
  order: { id: string; totalAmount: number },
) {
  const t = await getTranslations({ locale, namespace: "order.emails.confirmation" });
  return {
    subject: t("subject"),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 20px;">${t("heading")}</h1>
        <p style="color: #444;">${t("body", { orderId: order.id })}</p>
        <p style="font-weight: 600;">${t("total")}: ${formatPrice(order.totalAmount, locale)}</p>
      </div>
    `,
  };
}
