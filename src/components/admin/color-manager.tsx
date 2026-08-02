"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { ImageManager, type ManagedImage } from "@/components/admin/image-manager";
import { SizeStockPicker } from "@/components/admin/size-stock-picker";
import { Button } from "@/components/ui/button";
import type { LocalizedText } from "@/lib/types";

interface SizeOption {
  id: string;
  label: string;
  orderIndex: number;
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
  orderIndex: number;
  images: ManagedImage[];
  variants: VariantData[];
}

function reorderIds(ids: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return ids;
  const without = ids.filter((id) => id !== draggedId);
  const targetIndex = without.indexOf(targetId);
  without.splice(targetIndex, 0, draggedId);
  return without;
}

/** Which parts of a color card to render - lets the product creation wizard
 * show "colors & images" and "sizes & stock" as separate steps while the
 * full edit page still shows everything together. */
export type ColorManagerStage = "full" | "images" | "sizes";

export function ColorManager({
  productId,
  colors,
  sizes,
  stage = "full",
}: {
  productId: string;
  colors: ColorData[];
  sizes: SizeOption[];
  stage?: ColorManagerStage;
}) {
  const router = useRouter();
  const onChanged = () => router.refresh();
  const [dragColorId, setDragColorId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleColorDrop(targetId: string) {
    if (!dragColorId) return;
    const newOrder = reorderIds(colors.map((c) => c.id), dragColorId, targetId);
    setDragColorId(null);
    setReordering(true);
    await fetch(`/api/admin/products/${productId}/colors/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newOrder }),
    });
    setReordering(false);
    onChanged();
  }

  return (
    <div className={`flex flex-col gap-8 ${reordering ? "opacity-60" : ""}`}>
      {colors.length > 1 && stage !== "sizes" && (
        <p className="text-xs text-ink-soft">גררי כרטיס צבע לפי הכותרת כדי לשנות את סדר הצבעים בדף המוצר.</p>
      )}
      {colors.map((color) => (
        <div
          key={color.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleColorDrop(color.id);
          }}
        >
          <ColorCard
            color={color}
            sizes={sizes}
            stage={stage}
            onChanged={onChanged}
            onDragHandleStart={() => setDragColorId(color.id)}
          />
        </div>
      ))}
      {stage !== "sizes" && <NewColorForm productId={productId} onCreated={onChanged} />}
    </div>
  );
}

function ColorCard({
  color,
  sizes,
  stage,
  onChanged,
  onDragHandleStart,
}: {
  color: ColorData;
  sizes: SizeOption[];
  stage: ColorManagerStage;
  onChanged: () => void;
  onDragHandleStart: () => void;
}) {
  const [name, setName] = useState(color.name);
  const [hexCode, setHexCode] = useState(color.hexCode);
  const [images, setImages] = useState<ManagedImage[]>(color.images);
  const [saving, setSaving] = useState(false);
  const canSave = images.length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await fetch(`/api/admin/colors/${color.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        hexCode,
        images: images.map(({ url, isPrimary }) => ({ url, isPrimary })),
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

  if (stage === "sizes") {
    return (
      <div className="rounded-md border border-line bg-white shadow-sm p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-6 w-6 shrink-0 rounded-full border border-ink/20" style={{ backgroundColor: hexCode }} />
          <span className="font-medium">{name.he}</span>
        </div>
        <SizeStockPicker colorId={color.id} allSizes={sizes} variants={color.variants} onChanged={onChanged} />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          <button
            type="button"
            draggable
            onDragStart={onDragHandleStart}
            title="גררי כדי לשנות סדר"
            className="mt-6 cursor-move text-ink/30 hover:text-ink/60"
          >
            ⠿
          </button>
          <span
            className="mt-6 h-6 w-6 shrink-0 rounded-full border border-ink/20"
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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(hexCode) ? hexCode : "#000000"}
            onChange={(e) => setHexCode(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded border border-ink/20"
          />
          <input
            value={hexCode}
            onChange={(e) => setHexCode(e.target.value)}
            className="w-full rounded border border-ink/20 px-2 py-1"
          />
        </div>
      </label>

      <div className="mt-4">
        <span className="mb-2 block text-sm font-medium">תמונות הצבע</span>
        <ImageManager images={images} onChange={setImages} />
      </div>

      <Button variant="secondary" type="button" onClick={handleSave} disabled={saving || !canSave} className="mt-3">
        {saving ? "שומרת..." : "שמירת צבע"}
      </Button>

      {stage === "full" && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium">מידות ומלאי</h4>
          <SizeStockPicker colorId={color.id} allSizes={sizes} variants={color.variants} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}

function NewColorForm({ productId, onCreated }: { productId: string; onCreated: () => void }) {
  const [name, setName] = useState<LocalizedText>({ he: "", fr: "", en: "" });
  const [hexCode, setHexCode] = useState("#000000");
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSave = images.length > 0 && name.he.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        hexCode,
        images: images.map(({ url, isPrimary }) => ({ url, isPrimary })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("הוספת הצבע נכשלה - ודאי שהזנת שם צבע ולפחות תמונה אחת.");
      return;
    }
    setName({ he: "", fr: "", en: "" });
    setHexCode("#000000");
    setImages([]);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border-dashed border-ink/25 bg-cream-deep/30 p-4">
      <h3 className="text-sm font-medium">הוספת צבע חדש</h3>
      <LocaleTabsInput label="שם הצבע" value={name} onChange={setName} />
      <label className="flex w-40 flex-col gap-1 text-sm">
        <span>קוד צבע (hex)</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(hexCode) ? hexCode : "#000000"}
            onChange={(e) => setHexCode(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded border border-ink/20"
          />
          <input
            value={hexCode}
            onChange={(e) => setHexCode(e.target.value)}
            className="w-full rounded border border-ink/20 px-2 py-1"
          />
        </div>
      </label>
      <div>
        <span className="mb-2 block text-sm font-medium">תמונות הצבע</span>
        <ImageManager images={images} onChange={setImages} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving || !canSave} className="w-fit">
        {saving ? "מוסיפה..." : "הוספת צבע"}
      </Button>
    </form>
  );
}
