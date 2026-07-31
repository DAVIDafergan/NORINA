import { MockPaymentProvider } from "./mock-provider";
import { UPaySummitProvider } from "./upay-summit-provider";
import type { PaymentProvider } from "./types";

export type * from "./types";

/**
 * Defaults to the mock provider until PAYMENT_PROVIDER=upay is set AND
 * upay-summit-provider.ts has been filled in with real API calls - see the
 * TODO there.
 */
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";
  switch (configured) {
    case "upay":
      return new UPaySummitProvider();
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}
