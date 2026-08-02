"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { slugify } from "@/lib/slugify";
import type { LocalizedText } from "@/lib/types";

interface CategoryData {
  id: string;
  slug: string;
  name: LocalizedText;
  productCount: number;
}

function reorderIds(ids: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return ids;
  const without = ids.filter((id) => id !== draggedId);
  const targetIndex = without.indexOf(targetId);
  without.splice(targetIndex, 0, draggedId);
  return without;
}

export function CategoryManager({ categories }: { categories: CategoryData[] }) {
  const router = useRouter();
  const onChanged = () => router.refresh();
  const [dragId, setDragId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleDrop(targetId: string) {
    if (!dragId) return;
    const newOrder = reorderIds(categories.map((c) => c.id), dragId, targetId);
    setDragId(null);
    setReordering(true);
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newOrder }),
    });
    setReordering(false);
    onChanged();
  }

  return (
    <div className={`flex flex-col gap-4 ${reordering ? "opacity-60" : ""}`}>
      {categories.map((category) => (
        <div
          key={category.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(category.id);
          }}
        >
          <CategoryCard category={category} onChanged={onChanged} onDragHandleStart={() => setDragId(category.id)} />
        </div>
      ))}
      <NewCategoryForm onCreated={onChanged} />
    </div>
  );
}

function CategoryCard({
  category,
  onChanged,
  onDragHandleStart,
}: {
  category: CategoryData;
  onChanged: () => void;
  onDragHandleStart: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "slug_in_use" ? "כתובת ה-slug הזו כבר בשימוש" : "השמירה נכשלה");
      return;
    }
    onChanged();
  }

  async function handleDelete() {
    if (!confirm("למחוק את הקטגוריה?")) return;
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? "מחיקה נכשלה");
      return;
    }
    onChanged();
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
            className="mt-6 cursor-move text-ink/20 hover:text-ink-soft"
          >
            ⠿
          </button>
          <div className="flex flex-1 flex-col gap-3">
            <LocaleTabsInput label="שם הקטגוריה" value={name} onChange={setName} />
            <TextField label="Slug (לכתובת ה-URL)" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={category.productCount > 0}
            title={category.productCount > 0 ? `לא ניתן למחוק - ${category.productCount} מוצרים משויכים` : undefined}
            className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-ink/20 disabled:no-underline"
          >
            מחיקה
          </button>
          <span className="text-xs text-ink/45">{category.productCount} מוצרים</span>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button variant="secondary" type="button" onClick={handleSave} disabled={saving} className="mt-3">
        {saving ? "שומרת..." : "שמירה"}
      </Button>
    </div>
  );
}

function NewCategoryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState<LocalizedText>({ he: "", fr: "", en: "" });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSave = name.he.trim().length > 0 && slug.trim().length > 0;

  function handleNameChange(next: LocalizedText) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next.en || next.he));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "slug_in_use" ? "כתובת ה-slug הזו כבר בשימוש" : "היצירה נכשלה");
      return;
    }
    setName({ he: "", fr: "", en: "" });
    setSlug("");
    setSlugTouched(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border-dashed border-ink/25 bg-cream-deep/30 p-4">
      <h3 className="text-sm font-medium">קטגוריה חדשה</h3>
      <LocaleTabsInput label="שם הקטגוריה" value={name} onChange={handleNameChange} />
      <TextField
        label="Slug (לכתובת ה-URL)"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(slugify(e.target.value));
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving || !canSave} className="w-fit">
        {saving ? "יוצרת..." : "יצירת קטגוריה"}
      </Button>
    </form>
  );
}
