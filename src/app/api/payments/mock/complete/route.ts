import { NextResponse } from "next/server";
import { confirmOrderPayment } from "@/lib/orders/confirm-payment";
import { buildOrderConfirmationEmail } from "@/lib/orders/order-email";
import { getEmailSender } from "@/lib/email";
import { OutOfStockError } from "@/lib/orders/errors";
import type { Locale } from "@/lib/types";

/** Dev-only completion endpoint for MockPaymentProvider - see src/lib/payments/mock-provider.ts. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const providerReference = url.searchParams.get("providerReference");
  const successUrl = url.searchParams.get("successUrl");
  const locale = (url.searchParams.get("locale") ?? "he") as Locale;

  if (!orderId || !providerReference || !successUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let order;
  try {
    order = await confirmOrderPayment({ orderId, providerReference, providerName: "mock" });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return NextResponse.redirect(new URL(`/${locale}/order/${orderId}/confirmation`, request.url));
    }
    throw error;
  }

  const { subject, html } = await buildOrderConfirmationEmail(locale, {
    id: order.id,
    totalAmount: Number(order.totalAmount),
  });
  await getEmailSender().send({ to: order.contactEmail, subject, html });

  return NextResponse.redirect(successUrl);
}
