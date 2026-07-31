import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, PaymentWebhookEvent } from "./types";

/**
 * Local/dev-only stand-in for a real gateway. It never talks to a real payment
 * network - it just redirects the browser to /api/payments/mock/complete,
 * which runs the exact same order-confirmation code path a real webhook would
 * (see src/lib/orders/confirm-payment.ts), so the whole checkout -> paid ->
 * stock-decrement flow can be built and tested without real U-PAY credentials.
 *
 * Must be swapped for a real PaymentProvider (see upay-summit-provider.ts)
 * before going live.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const providerReference = `mock_${params.orderId}_${Date.now()}`;
    const redirectUrl = new URL("/api/payments/mock/complete", params.successUrl);
    redirectUrl.searchParams.set("orderId", params.orderId);
    redirectUrl.searchParams.set("providerReference", providerReference);
    redirectUrl.searchParams.set("successUrl", params.successUrl);
    redirectUrl.searchParams.set("locale", params.locale);
    return { redirectUrl: redirectUrl.toString(), providerReference };
  }

  async parseWebhook(request: Request): Promise<PaymentWebhookEvent> {
    const body = await request.json();
    return { orderId: body.orderId, providerReference: body.providerReference, status: "paid" };
  }
}
