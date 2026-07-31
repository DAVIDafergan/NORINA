export type OrderErrorCode =
  | "empty_cart"
  | "invalid_variant"
  | "insufficient_stock"
  | "missing_address"
  | "missing_pickup_location"
  | "order_not_found";

export class OrderError extends Error {
  code: OrderErrorCode;

  constructor(code: OrderErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export class OutOfStockError extends Error {}
