"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CloseIcon } from "@/components/icons";

interface VariantData {
  id: string;
  sizeLabel: string;
  colorName: string;
  stockQuantity: number;
}

export function QuickStockButton({
  productName,
  totalStock,
  lowStock,
  variants,
}: {
  productName: string;
  totalStock: number;
  lowStock: boolean;
  variants: VariantData[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-sm px-2 py-1 underline decoration-dotted transition-colors hover:bg-cream-deep ${
          lowStock ? "text-amber-600" : ""
        }`}
        title="עדכון מהיר של מלאי"
      >
        {totalStock}
      </button>
      {open && <QuickStockModal productName={productName} variants={variants} onClose={() => setOpen(false)} />}
    </>
  );
}

function QuickStockModal({
  productName,
  variants,
  onClose,
}: {
  productName: string;
  variants: VariantData[];
  onClose: () => void;
}) {
  const router = useRouter();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/40 animate-fade-up" />
      <div className="relative flex max-h-[85vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-sm bg-cream p-6 shadow-xl animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-medium">{productName} — עדכון מלאי מהיר</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/60 hover:text-gold"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-ink-soft">למוצר הזה אין עדיין מידות עם מלאי.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {variants.map((variant) => (
              <VariantRow key={variant.id} variant={variant} onSaved={() => router.refresh()} />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function VariantRow({ variant, onSaved }: { variant: VariantData; onSaved: () => void }) {
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
    onSaved();
  }

  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="flex-1">
        {variant.colorName} · {variant.sizeLabel}
      </span>
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        onBlur={handleBlur}
        className="w-20 rounded-sm border border-ink/20 px-2 py-1.5 focus:border-gold focus:outline-none"
      />
      {saving && <span className="text-xs text-ink-soft">שומר...</span>}
    </label>
  );
}
