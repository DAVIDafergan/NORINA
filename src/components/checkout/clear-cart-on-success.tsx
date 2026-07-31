"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cart-store";

/** Empties the cart once, client-side, after a successful checkout. */
export function ClearCartOnSuccess() {
  const clear = useCartStore((state) => state.clear);
  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      clear();
    }
  }, [clear]);

  return null;
}
