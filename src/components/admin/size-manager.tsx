"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

interface SizeData {
  id: string;
  label: string;
  bustMin: number | null;
  bustMax: number | null;
  waistMin: number | null;
  waistMax: number | null;
  hipsMin: number | null;
  hipsMax: number | null;
  variantCount: number;
}

type MeasurementFields = Pick<SizeData, "bustMin" | "bustMax" | "waistMin" | "waistMax" | "hipsMin" | "hipsMax">;

const EMPTY_MEASUREMENTS: MeasurementFields = {
  bustMin: null,
  bustMax: null,
  waistMin: null,
  waistMax: null,
  hipsMin: null,
  hipsMax: null,
};

function reorderIds(ids: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return ids;
  const without = ids.filter((id) => id !== draggedId);
  const targetIndex = without.indexOf(targetId);
  without.splice(targetIndex, 0, draggedId);
  return without;
}

function MeasurementFieldRow({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  min: number | null;
  max: number | null;
  onMinChange: (v: number | null) => void;
  onMaxChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-14 text-ink-soft">{label}</span>
      <input
        type="number"
        min={0}
        placeholder="מ-"
        value={min ?? ""}
        onChange={(e) => onMinChange(e.target.value === "" ? null : Number(e.target.value))}
        className="min-h-11 w-20 rounded-sm border border-ink/20 px-2 py-2 focus:border-gold focus:outline-none"
      />
      <span className="text-ink/30">—</span>
      <input
        type="number"
        min={0}
        placeholder="עד"
        value={max ?? ""}
        onChange={(e) => onMaxChange(e.target.value === "" ? null : Number(e.target.value))}
        className="min-h-11 w-20 rounded-sm border border-ink/20 px-2 py-2 focus:border-gold focus:outline-none"
      />
      <span className="text-xs text-ink/40">ס״מ</span>
    </div>
  );
}

export function SizeManager({ sizes }: { sizes: SizeData[] }) {
  const router = useRouter();
  const onChanged = () => router.refresh();
  const [dragId, setDragId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleDrop(targetId: string) {
    if (!dragId) return;
    const newOrder = reorderIds(sizes.map((s) => s.id), dragId, targetId);
    setDragId(null);
    setReordering(true);
    await fetch("/api/admin/sizes/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newOrder }),
    });
    setReordering(false);
    onChanged();
  }

  return (
    <div className={`flex flex-col gap-4 ${reordering ? "opacity-60" : ""}`}>
      {sizes.map((size) => (
        <div
          key={size.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(size.id);
          }}
        >
          <SizeCard size={size} onChanged={onChanged} onDragHandleStart={() => setDragId(size.id)} />
        </div>
      ))}
      <NewSizeForm onCreated={onChanged} />
    </div>
  );
}

function SizeCard({
  size,
  onChanged,
  onDragHandleStart,
}: {
  size: SizeData;
  onChanged: () => void;
  onDragHandleStart: () => void;
}) {
  const [label, setLabel] = useState(size.label);
  const [measurements, setMeasurements] = useState<MeasurementFields>(size);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/sizes/${size.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, ...measurements }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "label_in_use" ? "התווית כבר בשימוש" : "השמירה נכשלה");
      return;
    }
    onChanged();
  }

  async function handleDelete() {
    if (!confirm("למחוק את המידה?")) return;
    const res = await fetch(`/api/admin/sizes/${size.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    onChanged();
  }

  return (
    <div className="rounded border border-ink/12 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            draggable
            onDragStart={onDragHandleStart}
            title="גררי כדי לשנות סדר"
            className="cursor-move text-ink/30 hover:text-ink/60"
          >
            ⠿
          </button>
          <TextField label="תווית" value={label} onChange={(e) => setLabel(e.target.value)} className="w-24" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={size.variantCount > 0}
            title={size.variantCount > 0 ? `לא ניתן למחוק - ${size.variantCount} וריאנטים משויכים` : undefined}
            className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-ink/25 disabled:no-underline"
          >
            מחיקה
          </button>
          <span className="text-xs text-ink-soft">{size.variantCount} וריאנטים</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <MeasurementFieldRow
          label="חזה"
          min={measurements.bustMin}
          max={measurements.bustMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, bustMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, bustMax: v }))}
        />
        <MeasurementFieldRow
          label="מותן"
          min={measurements.waistMin}
          max={measurements.waistMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, waistMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, waistMax: v }))}
        />
        <MeasurementFieldRow
          label="ירכיים"
          min={measurements.hipsMin}
          max={measurements.hipsMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, hipsMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, hipsMax: v }))}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button variant="secondary" type="button" onClick={handleSave} disabled={saving} className="mt-3">
        {saving ? "שומרת..." : "שמירה"}
      </Button>
    </div>
  );
}

function NewSizeForm({ onCreated }: { onCreated: () => void }) {
  const [label, setLabel] = useState("");
  const [measurements, setMeasurements] = useState<MeasurementFields>(EMPTY_MEASUREMENTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, ...measurements }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "label_in_use" ? "התווית כבר בשימוש" : "היצירה נכשלה");
      return;
    }
    setLabel("");
    setMeasurements(EMPTY_MEASUREMENTS);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded border border-dashed border-ink/20 p-4">
      <h3 className="text-sm font-medium">מידה חדשה</h3>
      <TextField label="תווית" value={label} onChange={(e) => setLabel(e.target.value)} className="w-24" />
      <div className="flex flex-col gap-2">
        <MeasurementFieldRow
          label="חזה"
          min={measurements.bustMin}
          max={measurements.bustMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, bustMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, bustMax: v }))}
        />
        <MeasurementFieldRow
          label="מותן"
          min={measurements.waistMin}
          max={measurements.waistMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, waistMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, waistMax: v }))}
        />
        <MeasurementFieldRow
          label="ירכיים"
          min={measurements.hipsMin}
          max={measurements.hipsMax}
          onMinChange={(v) => setMeasurements((m) => ({ ...m, hipsMin: v }))}
          onMaxChange={(v) => setMeasurements((m) => ({ ...m, hipsMax: v }))}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving || !label.trim()} className="w-fit">
        {saving ? "יוצרת..." : "יצירת מידה"}
      </Button>
    </form>
  );
}
