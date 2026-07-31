import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { Locale } from "@/lib/types";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [pickupLocations, shippingSetting] = await Promise.all([
    prisma.pickupLocation.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.shippingSetting.findFirst(),
  ]);

  return (
    <CheckoutForm
      locale={loc}
      pickupLocations={pickupLocations.map((location) => ({
        id: location.id,
        name: getLocalizedText(location.cityName, loc),
      }))}
      flatRatePrice={shippingSetting ? Number(shippingSetting.flatRatePrice) : 0}
      freeShippingAbove={
        shippingSetting?.freeShippingAbove ? Number(shippingSetting.freeShippingAbove) : null
      }
    />
  );
}
