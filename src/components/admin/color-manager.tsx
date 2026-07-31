"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { Button } from "@/components/ui/button";
import type { LocalizedText } from "@/lib/types";

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
interface ColorData {
  id: string;
  name: LocalizedText;
  hexCode: string;
  images: string[];
  variants: VariantData[];
}

export function ColorManager({
  productId,
  colors,
  sizes,
}: {
  productId: string;
  colors: ColorData[];
  sizes: SizeOption[];
}) {
  const router = useRouter();
  const onChanged = () => router.refresh();

  return (
    <div className="flex flex-col gap-8">
      {colors.map((color) => (
        <ColorCard key={color.id} color={color} sizes={sizes} onChanged={onChanged} />
      ))}
      <NewColorForm productId={productId} onCreated={onChanged} />
    </div>
  );
}

function ColorCard({
  color,
  sizes,
  onChanged,
}: {
  color: ColorData;
  sizes: SizeOption[];
  onChanged: () => void;
}) {
  const [name, setName] = useState(color.name);
  const [hexCode, setHexCode] = useState(color.hexCode);
  const [imagesText, setImagesText] = useState(color.images.join("\n"));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/colors/${color.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        hexCode,
        imageUrls: imagesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    setSaving(false);
    onChanged();
  }

  async function handleDelete() {
    if (!confirm("למחוק את הצבע?")) return;
    const res = await fetch(`/api/admin/colors/${color.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    onChanged();
  }

  const existingSizeIds = new Set(color.variants.map((v) => v.sizeId));
  const availableSizes = sizes.filter((s) => !existingSizeIds.has(s.id));

  return (
    <div className="rounded border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          <span
            className="mt-6 h-6 w-6 shrink-0 rounded-full border border-zinc-300"
            style={{ backgroundColor: hexCode }}
          />
          <LocaleTabsInput label="שם הצבע" value={name} onChange={setName} />
        </div>
        <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
          מחיקה
        </button>
      </div>

      <label className="mt-3 flex w-32 flex-col gap-1 text-sm">
        <span>קוד צבע (hex)</span>
        <input
          value={hexCode}
          onChange={(e) => setHexCode(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1"
        />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-sm">
        <span>קישורי תמונות (שורה לכל תמונה)</span>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          className="rounded border border-zinc-300 px-3 py-2 font-mono text-xs"
        />
      </label>

      <Button variant="secondary" type="button" onClick={handleSave} disabled={saving} className="mt-3">
        {saving ? "שומרת..." : "שמירת צבע"}
      </Button>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-medium">מידות ומלאי</h4>
        <table className="w-full text-sm">
          <tbody>
            {color.variants.map((variant) => (
              <VariantRow key={variant.id} variant={variant} onChanged={onChanged} />
            ))}
          </tbody>
        </table>
        {availableSizes.length > 0 && (
          <AddVariantForm colorId={color.id} sizes={availableSizes} onCreated={onChanged} />
        )}
      </div>
    </div>
  );
}

function VariantRow({ variant, onChanged }: { variant: VariantData; onChanged: () => void }) {
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

  async function handleDelete() {
    if (!confirm("למחוק מידה זו?")) return;
    const res = await fetch(`/api/admin/variants/${variant.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    onChanged();
  }

  return (
    <tr className="border-b border-zinc-100">
      <td className="w-24 py-2">{variant.sizeLabel}</td>
      <td className="py-2">
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={handleBlur}
          className="w-20 rounded border border-zinc-300 px-2 py-1"
        />
        {saving && <span className="ms-2 text-xs text-zinc-400">שומר...</span>}
      </td>
      <td className="py-2 text-end">
        <button type="button" onClick={handleDelete} className="text-xs text-red-600 hover:underline">
          מחיקה
        </button>
      </td>
    </tr>
  );
}

function AddVariantForm({
  colorId,
  sizes,
  onCreated,
}: {
  colorId: string;
  sizes: SizeOption[];
  onCreated: () => void;
}) {
  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? "");
  const [stock, setStock] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    setSaving(true);
    const res = await fetch(`/api/admin/colors/${colorId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sizeId, stockQuantity: stock }),
    });
    setSaving(false);
    if (res.ok) onCreated();
  }

  return (
    <div className="mt-3 flex items-end gap-2">
      <label className="flex flex-col gap-1 text-xs">
        <span>מידה</span>
        <select
          value={sizeId}
          onChange={(e) => setSizeId(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        >
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>מלאי</span>
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <Button type="button" variant="secondary" onClick={handleAdd} disabled={saving || !sizeId}>
        הוספת מידה
      </Button>
    </div>
  );
}

function NewColorForm({ productId, onCreated }: { productId: string; onCreated: () => void }) {
  const [name, setName] = useState<LocalizedText>({ he: "", fr: "", en: "" });
  const [hexCode, setHexCode] = useState("#000000");
  const [imagesText, setImagesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        hexCode,
        imageUrls: imagesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("הוספת הצבע נכשלה - ודאי שהזנת קישורי תמונה תקינים (https://...)");
      return;
    }
    setName({ he: "", fr: "", en: "" });
    setHexCode("#000000");
    setImagesText("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded border border-dashed border-zinc-300 p-4">
      <h3 className="text-sm font-medium">הוספת צבע חדש</h3>
      <LocaleTabsInput label="שם הצבע" value={name} onChange={setName} />
      <label className="flex w-32 flex-col gap-1 text-sm">
        <span>קוד צבע (hex)</span>
        <input
          value={hexCode}
          onChange={(e) => setHexCode(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>קישורי תמונות (שורה לכל תמונה)</span>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          placeholder="https://..."
          className="rounded border border-zinc-300 px-3 py-2 font-mono text-xs"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "מוסיפה..." : "הוספת צבע"}
      </Button>
    </form>
  );
}
