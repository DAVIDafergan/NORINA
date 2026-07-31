import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, PaymentWebhookEvent } from "./types";

/**
 * TODO(U-PAY / Summit integration): structural placeholder only.
 *
 * We don't have U-PAY's real API documentation (endpoints, auth scheme,
 * request/response shapes, webhook signature format), so nothing here makes
 * real HTTP calls - that would mean guessing at an API contract, which is
 * exactly what we were asked not to do. Both methods throw on purpose so a
 * misconfigured deployment fails loudly instead of silently pretending
 * payment works.
 *
 * To finish this integration once Summit/U-PAY's docs are available:
 *   1. createPayment(): call U-PAY's "create transaction" endpoint (likely
 *      needs a merchant/terminal ID + API key from Summit's management
 *      console - see .env.example UPAY_* placeholders) with the order amount
 *      (ILS), and return the hosted-payment-page URL they give back as
 *      `redirectUrl`, plus their transaction id as `providerReference`.
 *   2. parseWebhook(): verify the callback's signature per U-PAY's spec
 *      (likely an HMAC header or shared secret), then map their status
 *      field to our "paid" | "failed" | "cancelled".
 *   3. Register the real webhook URL (/api/payments/webhook) in Summit's
 *      management console once it's known.
 *   4. Confirm whether U-PAY supports Bit as a separate payment method or
 *      as a line item on the same hosted page - the spec asks for both
 *      credit card and Bit support.
 */
export class UPaySummitProvider implements PaymentProvider {
  readonly name = "upay";

  async createPayment(_params: CreatePaymentParams): Promise<CreatePaymentResult> {
    throw new Error(
      "UPaySummitProvider.createPayment is not implemented - real U-PAY/Summit API docs are needed. " +
        "See the TODO in src/lib/payments/upay-summit-provider.ts and DECISIONS.md (stage 6).",
    );
  }

  async parseWebhook(_request: Request): Promise<PaymentWebhookEvent> {
    throw new Error(
      "UPaySummitProvider.parseWebhook is not implemented - real U-PAY/Summit API docs are needed. " +
        "See the TODO in src/lib/payments/upay-summit-provider.ts and DECISIONS.md (stage 6).",
    );
  }
}
