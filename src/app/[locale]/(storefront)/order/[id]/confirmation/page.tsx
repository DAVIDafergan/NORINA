import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import type { Locale } from "@/lib/types";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const t = await getTranslations("orderConfirmation");
  const tCart = await getTranslations("cart");

  const statusKey =
    order.status === "PAID" ? "statusPaid" : order.status === "CANCELLED" ? "statusCancelled" : "statusPending";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center animate-fade-up">
      {order.status === "PAID" && <ClearCartOnSuccess />}
      <h1 className="font-serif text-3xl tracking-wide">{t("title")}</h1>
      <p className="text-ink-soft">
        {t("orderNumber")}: <span className="font-mono">{order.id}</span>
      </p>
      <p className="text-lg font-medium">{formatPrice(Number(order.totalAmount), loc)}</p>
      <p className="text-ink/70">{t(statusKey)}</p>
      <Link href="/" className="mt-2 text-sm font-medium text-ink transition-colors hover:text-gold">
        {tCart("continueShopping")}
      </Link>
    </div>
  );
}
