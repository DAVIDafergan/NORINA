"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS, ORDER_STATUS_ORDER } from "@/lib/admin/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: event.target.value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span>סטטוס:</span>
      <select
        defaultValue={status}
        onChange={handleChange}
        disabled={saving}
        className="rounded border border-zinc-300 px-3 py-2"
      >
        {ORDER_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
