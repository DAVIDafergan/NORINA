export interface CreatePaymentParams {
  orderId: string;
  /** Total amount in ILS. */
  amount: number;
  customerEmail: string;
  customerName: string;
  /** Customer's locale, so any provider-side hosted page / confirmation email can match it. */
  locale: string;
  /** Where to send the browser once payment succeeds. */
  successUrl: string;
  /** Where to send the browser if the customer cancels/abandons payment. */
  cancelUrl: string;
}

export interface CreatePaymentResult {
  /** URL the browser should be sent to in order to complete payment (hosted checkout page, iframe host, etc). */
  redirectUrl: string;
  /** The provider's own identifier for this payment session/transaction. Stored on Order.paymentReference. */
  providerReference: string;
}

export type PaymentEventStatus = "paid" | "failed" | "cancelled";

export interface PaymentWebhookEvent {
  orderId: string;
  providerReference: string;
  status: PaymentEventStatus;
}

/**
 * Provider-agnostic payment gateway boundary. Every concrete provider
 * (mock, U-PAY/Summit, ...) implements this so the checkout flow
 * (src/lib/orders) never talks to a specific gateway's API directly.
 */
export interface PaymentProvider {
  readonly name: string;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  /** Verifies and parses an incoming payment callback/webhook. Must throw if the signature/payload is invalid. */
  parseWebhook(request: Request): Promise<PaymentWebhookEvent>;
}
