import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { confirmOrderPayment } from "@/lib/orders/confirm-payment";

/**
 * Generic webhook endpoint for whichever provider is configured via
 * PAYMENT_PROVIDER. Once the real U-PAY integration exists, register this
 * URL in Summit's management console - see the TODO in
 * src/lib/payments/upay-summit-provider.ts.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const event = await provider.parseWebhook(request);

  if (event.status !== "paid") {
    return NextResponse.json({ ok: true, ignored: event.status });
  }

  await confirmOrderPayment({
    orderId: event.orderId,
    providerReference: event.providerReference,
    providerName: provider.name,
  });

  return NextResponse.json({ ok: true });
}
