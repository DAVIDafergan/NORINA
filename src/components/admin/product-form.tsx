"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { Button } from "@/components/ui/button";
import type { LocalizedText } from "@/lib/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  productId?: string;
  categories: CategoryOption[];
  initial?: {
    name: LocalizedText;
    description: LocalizedText;
    categoryId: string;
    basePrice: number;
    isActive: boolean;
  };
}

const EMPTY: LocalizedText = { he: "", fr: "", en: "" };

export function ProductForm({ productId, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState<LocalizedText>(initial?.name ?? EMPTY);
  const [description, setDescription] = useState<LocalizedText>(initial?.description ?? EMPTY);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [basePrice, setBasePrice] = useState(initial?.basePrice?.toString() ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      categoryId,
      basePrice: Number(basePrice),
      isActive,
    };

    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      setError("שמירת המוצר נכשלה, נסי שוב.");
      return;
    }

    if (!productId) {
      const { id } = await res.json();
      router.push(`/admin/products/${id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <LocaleTabsInput label="שם המוצר" value={name} onChange={setName} />
      <LocaleTabsInput label="תיאור" value={description} onChange={setDescription} multiline />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">קטגוריה</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">מחיר בסיס (₪)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span>פעיל (מוצג בחנות)</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "שומרת..." : productId ? "שמירת שינויים" : "יצירת מוצר"}
      </Button>
    </form>
  );
}
