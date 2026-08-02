"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ShippingSettingsForm({
  flatRatePrice,
  freeShippingAbove,
}: {
  flatRatePrice: number;
  freeShippingAbove: number | null;
}) {
  const router = useRouter();
  const [flatRate, setFlatRate] = useState(flatRatePrice.toString());
  const [freeAbove, setFreeAbove] = useState(freeShippingAbove?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/shipping-setting", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flatRatePrice: Number(flatRate),
        freeShippingAbove: freeAbove ? Number(freeAbove) : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">מחיר משלוח ארצי (₪)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={flatRate}
          onChange={(e) => setFlatRate(e.target.value)}
          className="rounded border border-ink/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">משלוח חינם מעל סכום (₪) - ריק = בלי משלוח חינם</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={freeAbove}
          onChange={(e) => setFreeAbove(e.target.value)}
          className="rounded border border-ink/20 px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "שומרת..." : "שמירה"}
      </Button>
      {saved && <p className="text-sm text-green-700">נשמר בהצלחה.</p>}
    </form>
  );
}
