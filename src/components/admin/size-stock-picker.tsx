"use client";

import { useState } from "react";

interface SizeOption {
  id: string;
  label: string;
}
interface VariantData {
  id: string;
  sizeId: string;
  sizeLabel: string;
  stockQuantity: number;
}

/**
 * Tap-to-select size chips (from the global size pool managed at
 * /admin/sizes) + a plain quantity input per selected size - replaces the
 * old free-text/always-show-every-size-row approach. Toggling a chip
 * creates/deletes the underlying ProductVariant immediately (stock=0 on
 * create), so there's no separate "unsaved" selection state to track.
 */
export function SizeStockPicker({
  colorId,
  allSizes,
  variants,
  onChanged,
}: {
  colorId: string;
  allSizes: SizeOption[];
  variants: VariantData[];
  onChanged: () => void;
}) {
  const [pendingSizeId, setPendingSizeId] = useState<string | null>(null);

  async function toggleSize(size: SizeOption) {
    const existing = variants.find((v) => v.sizeId === size.id);
    setPendingSizeId(size.id);
    if (existing) {
      const res = await fetch(`/api/admin/variants/${existing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message ?? "לא ניתן להסיר מידה זו");
      }
    } else {
      await fetch(`/api/admin/colors/${colorId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizeId: size.id, stockQuantity: 0 }),
      });
    }
    setPendingSizeId(null);
    onChanged();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {allSizes.map((size) => {
          const selected = variants.some((v) => v.sizeId === size.id);
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => toggleSize(size)}
              disabled={pendingSizeId === size.id}
              className={`min-h-10 min-w-10 rounded-sm border px-3.5 text-sm transition-colors disabled:cursor-wait disabled:opacity-50 ${
                selected ? "border-ink bg-ink text-cream" : "border-ink/20 text-ink/70 hover:border-ink/50"
              }`}
            >
              {size.label}
            </button>
          );
        })}
        {allSizes.length === 0 && (
          <p className="text-sm text-ink-soft">
            אין עדיין מידות מוגדרות - הוסיפי אותן ב<span className="underline">ניהול {"→"} מידות</span> קודם.
          </p>
        )}
      </div>

      {variants.length > 0 && (
        <div className="flex flex-col gap-2">
          {variants.map((variant) => (
            <StockInput key={variant.id} variant={variant} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function StockInput({ variant, onChanged }: { variant: VariantData; onChanged: () => void }) {
  const [stock, setStock] = useState(variant.stockQuantity);
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (stock === variant.stockQuantity) return;
    setSaving(true);
    await fetch(`/api/admin/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: stock }),
    });
    setSaving(false);
    onChanged();
  }

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-10 font-medium">{variant.sizeLabel}</span>
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        onBlur={handleBlur}
        className="w-24 rounded-sm border border-ink/20 px-2 py-1.5 focus:border-gold focus:outline-none"
      />
      <span className="text-ink-soft">יחידות</span>
      {saving && <span className="text-xs text-ink-soft">שומר...</span>}
      {!saving && stock === 0 && <span className="text-xs text-amber-600">אין מלאי</span>}
    </label>
  );
}
