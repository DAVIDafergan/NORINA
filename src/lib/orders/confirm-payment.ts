import { prisma } from "@/lib/prisma";
import { OrderError, OutOfStockError } from "./errors";

export interface ConfirmPaymentInput {
  orderId: string;
  providerReference: string;
  providerName: string;
}

/**
 * The "golden rule" transaction from spec section 8: re-check availability
 * and decrement ProductVariant.stockQuantity atomically, in the same
 * transaction that marks the order PAID, so two customers racing for the
 * last unit can't both succeed. `updateMany` with a `stockQuantity: { gte }`
 * guard is what makes this safe under concurrency - if another transaction
 * already consumed the stock, `count` comes back 0 and we abort.
 *
 * Idempotent: a webhook (or the mock provider's redirect) firing twice for
 * an already-PAID order is a no-op rather than double-decrementing stock.
 */
export async function confirmOrderPayment(input: ConfirmPaymentInput) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order) {
    throw new OrderError("order_not_found");
  }
  if (order.status === "PAID") {
    return order;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new OutOfStockError(`Insufficient stock for variant ${item.productVariantId}`);
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentProvider: input.providerName,
          paymentReference: input.providerReference,
        },
      });
    });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      // TODO: once the real U-PAY integration exists, trigger a refund here
      // (see upay-summit-provider.ts) - for now the order is just cancelled
      // and needs manual follow-up via the admin panel (stage 8).
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    }
    throw error;
  }
}
