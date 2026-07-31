import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/orders/schemas";
import { createOrder } from "@/lib/orders/create-order";
import { OrderError } from "@/lib/orders/errors";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const input = parsed.data;
  const session = await getServerSession(authOptions);

  let order;
  try {
    order = await createOrder({
      userId: session?.user?.id ?? null,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
      deliveryType: input.deliveryType,
      address: input.address,
      pickupLocationId: input.pickupLocationId,
      items: input.items,
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.code }, { status: 409 });
    }
    throw error;
  }

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/${input.locale}/order/${order.id}/confirmation`;
  const cancelUrl = `${origin}/${input.locale}/checkout`;

  const provider = getPaymentProvider();
  const payment = await provider.createPayment({
    orderId: order.id,
    amount: Number(order.totalAmount),
    customerEmail: input.contactEmail,
    customerName: input.contactName,
    locale: input.locale,
    successUrl,
    cancelUrl,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentProvider: provider.name, paymentReference: payment.providerReference },
  });

  return NextResponse.json({ orderId: order.id, redirectUrl: payment.redirectUrl });
}
