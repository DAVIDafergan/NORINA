import { prisma } from "@/lib/prisma";
import { OrderError } from "./errors";
import { getShippingCost } from "./shipping-cost";

export interface CheckoutItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  deliveryType: "SHIPPING" | "PICKUP";
  address?: { city: string; street: string; zip?: string; phone: string; notes?: string };
  pickupLocationId?: string;
  items: CheckoutItemInput[];
}

/**
 * Creates a PENDING order with server-derived prices (never trusts client-
 * submitted prices) and a snapshot address. Deliberately does NOT touch
 * stock - per spec section 8, stock is only decremented atomically when the
 * order transitions to PAID (see confirm-payment.ts). The stock check here
 * is just an optimistic, non-locking check for a fast "sold out" UX message.
 */
export async function createOrder(input: CreateOrderInput) {
  if (input.items.length === 0) {
    throw new OrderError("empty_cart");
  }
  if (input.deliveryType === "SHIPPING" && !input.address) {
    throw new OrderError("missing_address");
  }
  if (input.deliveryType === "PICKUP" && !input.pickupLocationId) {
    throw new OrderError("missing_pickup_location");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((item) => item.variantId) } },
    include: { product: true },
  });

  const priced = input.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      throw new OrderError("invalid_variant");
    }
    if (variant.stockQuantity < item.quantity) {
      throw new OrderError("insufficient_stock", variant.id);
    }
    const unitPrice = Number(variant.priceOverride ?? variant.product.basePrice);
    return { variantId: variant.id, quantity: item.quantity, unitPrice };
  });

  const subtotal = priced.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingCost = await getShippingCost(input.deliveryType, subtotal);
  const totalAmount = subtotal + shippingCost;

  let addressId: string | undefined;
  if (input.deliveryType === "SHIPPING" && input.address) {
    const address = await prisma.address.create({
      data: { userId: input.userId ?? undefined, ...input.address },
    });
    addressId = address.id;
  }

  return prisma.order.create({
    data: {
      userId: input.userId ?? undefined,
      status: "PENDING",
      deliveryType: input.deliveryType,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
      addressId,
      pickupLocationId: input.deliveryType === "PICKUP" ? input.pickupLocationId : undefined,
      shippingCost,
      totalAmount,
      items: {
        create: priced.map((item) => ({
          productVariantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: item.unitPrice,
        })),
      },
    },
  });
}
