import { prisma } from "@/lib/prisma";
import type { DeliveryType } from "@/generated/prisma/enums";

/**
 * ShippingSetting is a singleton (see schema comment) - we always read the
 * first row. If the admin hasn't configured it yet (stage 8), shipping is
 * free until they do, rather than blocking checkout entirely.
 */
export async function getShippingCost(deliveryType: DeliveryType, subtotal: number): Promise<number> {
  if (deliveryType === "PICKUP") return 0;

  const setting = await prisma.shippingSetting.findFirst();
  if (!setting) return 0;

  if (setting.freeShippingAbove && subtotal >= Number(setting.freeShippingAbove)) {
    return 0;
  }
  return Number(setting.flatRatePrice);
}
