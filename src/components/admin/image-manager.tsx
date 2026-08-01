"use client";

import { useId, useRef, useState } from "react";
import { fileToResizedDataUrl } from "@/lib/admin/image-resize";

export interface ManagedImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

function reorder<T extends { id: string }>(items: T[], draggedId: string, targetId: string): T[] {
  if (draggedId === targetId) return items;
  const without = items.filter((item) => item.id !== draggedId);
  const dragged = items.find((item) => item.id === draggedId);
  if (!dragged) return items;
  const targetIndex = without.findIndex((item) => item.id === targetId);
  without.splice(targetIndex, 0, dragged);
  return without;
}

/**
 * Multi-image uploader for a single color's gallery: drag-and-drop or file
 * picker, instant thumbnail preview (before saving), drag-to-reorder, one
 * "primary" (cover) image, and per-image delete.
 */
export function ImageManager({
  images,
  onChange,
}: {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    const newImages: ManagedImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 20 * 1024 * 1024) {
        alert(`${file.name}: הקובץ גדול מדי (מקסימום 20MB)`);
        continue;
      }
      try {
        const url = await fileToResizedDataUrl(file);
        newImages.push({ id: `new-${crypto.randomUUID()}`, url, isPrimary: false });
      } catch {
        alert(`${file.name}: לא ניתן היה לעבד את התמונה`);
      }
    }
    setLoading(false);
    if (newImages.length === 0) return;

    const hadNoImages = images.length === 0;
    const merged = [...images, ...newImages];
    if (hadNoImages) merged[0].isPrimary = true;
    onChange(merged);
  }

  function setPrimary(id: string) {
    onChange(images.map((image) => ({ ...image, isPrimary: image.id === id })));
  }

  function removeImage(id: string) {
    const wasPrimary = images.find((image) => image.id === id)?.isPrimary;
    const remaining = images.filter((image) => image.id !== id);
    if (wasPrimary && remaining.length > 0) remaining[0].isPrimary = true;
    onChange(remaining);
  }

  function handleDrop(targetId: string) {
    setIsDropTarget(false);
    if (!dragId) return;
    onChange(reorder(images, dragId, targetId));
    setDragId(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropTarget(true);
        }}
        onDragLeave={() => setIsDropTarget(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDropTarget(false);
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-wrap gap-3 rounded border-2 border-dashed p-3 transition-colors ${
          isDropTarget ? "border-gold bg-gold/5" : "border-zinc-300"
        }`}
      >
        {images.map((image) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDragId(image.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrop(image.id);
            }}
            className={`group relative h-24 w-20 shrink-0 cursor-move overflow-hidden rounded border-2 ${
              image.isPrimary ? "border-gold" : "border-zinc-200"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-only, arbitrary/base64 image data */}
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPrimary(image.id)}
              title="סימון כתמונה ראשית"
              className={`absolute start-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                image.isPrimary ? "bg-gold text-white" : "bg-white/80 text-zinc-400 opacity-0 group-hover:opacity-100"
              }`}
            >
              ★
            </button>
            <button
              type="button"
              onClick={() => removeImage(image.id)}
              title="מחיקת תמונה"
              className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-xs text-red-600 opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}

        <label
          htmlFor={inputId}
          className="flex h-24 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-zinc-300 text-center text-xs text-zinc-500 hover:border-gold hover:text-gold"
        >
          <span className="text-lg leading-none">+</span>
          <span>{loading ? "מעלה..." : "הוספת תמונות"}</span>
        </label>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      </div>
      {images.length === 0 && <p className="text-xs text-red-600">חובה להעלות לפחות תמונה אחת לצבע.</p>}
      {images.length > 0 && (
        <p className="text-xs text-zinc-400">גררי כדי לסדר, לחצי על ★ לסימון תמונה ראשית.</p>
      )}
    </div>
  );
}
