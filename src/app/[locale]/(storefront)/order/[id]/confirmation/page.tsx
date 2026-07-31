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
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      {order.status === "PAID" && <ClearCartOnSuccess />}
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-zinc-500">
        {t("orderNumber")}: <span className="font-mono">{order.id}</span>
      </p>
      <p className="text-lg font-medium">{formatPrice(Number(order.totalAmount), loc)}</p>
      <p className="text-zinc-600">{t(statusKey)}</p>
      <Link href="/" className="font-medium hover:underline">
        {tCart("continueShopping")}
      </Link>
    </div>
  );
}
