import { setRequestLocale } from "next-intl/server";
import { CartPageContent } from "@/components/cart/cart-page-content";
import type { Locale } from "@/lib/types";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageContent locale={locale as Locale} />;
}
