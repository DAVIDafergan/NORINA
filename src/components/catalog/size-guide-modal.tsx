"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/components/icons";

export interface SizeGuideEntry {
  sizeId: string;
  label: string;
  bustMin: number | null;
  bustMax: number | null;
  waistMin: number | null;
  waistMax: number | null;
  hipsMin: number | null;
  hipsMax: number | null;
}

interface Measurements {
  bust: number | null;
  waist: number | null;
  hips: number | null;
}

function inRange(value: number, min: number | null, max: number | null) {
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

function midpoint(min: number | null, max: number | null): number | null {
  if (min !== null && max !== null) return (min + max) / 2;
  return min ?? max;
}

/** Recommends the best-fitting size from measurements: an exact match on every
 * filled dimension wins; otherwise the size with the smallest total distance
 * from its range midpoints is the closest fit. Only sizes with at least one
 * measurement dimension defined are considered. */
function recommendSize(sizes: SizeGuideEntry[], measurements: Measurements) {
  const candidates = sizes.filter(
    (s) => s.bustMin !== null || s.bustMax !== null || s.waistMin !== null || s.waistMax !== null || s.hipsMin !== null || s.hipsMax !== null,
  );
  if (candidates.length === 0) return null;

  const dims: { key: keyof Measurements; min: "bustMin" | "waistMin" | "hipsMin"; max: "bustMax" | "waistMax" | "hipsMax" }[] = [
    { key: "bust", min: "bustMin", max: "bustMax" },
    { key: "waist", min: "waistMin", max: "waistMax" },
    { key: "hips", min: "hipsMin", max: "hipsMax" },
  ];
  const filledDims = dims.filter((d) => measurements[d.key] !== null);
  if (filledDims.length === 0) return null;

  const exact = candidates.find((size) =>
    filledDims.every((d) => {
      const value = measurements[d.key];
      return value === null || inRange(value, size[d.min], size[d.max]);
    }),
  );
  if (exact) return { size: exact, exact: true };

  let best: SizeGuideEntry = candidates[0];
  let bestScore = Infinity;
  for (const size of candidates) {
    let score = 0;
    let scored = 0;
    for (const d of filledDims) {
      const value = measurements[d.key];
      const mid = midpoint(size[d.min], size[d.max]);
      if (value === null || mid === null) continue;
      score += Math.abs(value - mid);
      scored += 1;
    }
    if (scored === 0) continue;
    if (score < bestScore) {
      bestScore = score;
      best = size;
    }
  }
  return { size: best, exact: false };
}

export function SizeGuideModal({
  sizes,
  onSelectSize,
  onClose,
}: {
  sizes: SizeGuideEntry[];
  onSelectSize: (sizeId: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("product.sizeGuideModal");
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [result, setResult] = useState<{ size: SizeGuideEntry; exact: boolean } | "empty" | null>(null);

  const hasSizeData = sizes.some(
    (s) => s.bustMin !== null || s.bustMax !== null || s.waistMin !== null || s.waistMax !== null || s.hipsMin !== null || s.hipsMax !== null,
  );

  function handleFind(event: React.FormEvent) {
    event.preventDefault();
    const measurements: Measurements = {
      bust: bust ? Number(bust) : null,
      waist: waist ? Number(waist) : null,
      hips: hips ? Number(hips) : null,
    };
    if (measurements.bust === null && measurements.waist === null && measurements.hips === null) {
      setResult("empty");
      return;
    }
    setResult(recommendSize(sizes, measurements));
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/40 animate-fade-up" />
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-sm bg-cream p-6 shadow-xl animate-fade-up sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-xl tracking-wide">{t("title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/60 hover:text-gold"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {hasSizeData ? (
          <>
            <p className="text-sm text-ink-soft">{t("intro")}</p>
            <form onSubmit={handleFind} className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t("bust"), value: bust, onChange: setBust },
                  { label: t("waist"), value: waist, onChange: setWaist },
                  { label: t("hips"), value: hips, onChange: setHips },
                ].map((field) => (
                  <label key={field.label} className="flex flex-col gap-1 text-xs">
                    <span className="text-ink-soft">{field.label}</span>
                    <input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="rounded-sm border border-ink/20 px-2 py-2 text-sm focus:border-gold focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="min-h-11 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-gold"
              >
                {t("findButton")}
              </button>
            </form>

            {result === "empty" && <p className="text-sm text-red-600">{t("noMeasurements")}</p>}
            {result && result !== "empty" && (
              <div className="rounded-sm border border-gold/40 bg-gold-soft/20 p-4 text-sm">
                <p className="font-medium text-ink">
                  {t(result.exact ? "recommended" : "closeMatch", { size: result.size.label })}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectSize(result.size.sizeId)}
                  className="mt-3 text-sm font-medium text-gold hover:underline"
                >
                  {t("selectButton")}
                </button>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-soft">{t("tableTitle")}</p>
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-line text-ink-soft">
                    <th className="py-1.5 text-start">{t("tableSize")}</th>
                    <th className="py-1.5 text-start">{t("bust")}</th>
                    <th className="py-1.5 text-start">{t("waist")}</th>
                    <th className="py-1.5 text-start">{t("hips")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.sizeId} className="border-b border-line/60">
                      <td className="py-1.5 font-medium">{size.label}</td>
                      <td className="py-1.5">{size.bustMin || size.bustMax ? `${size.bustMin ?? ""}–${size.bustMax ?? ""}` : "—"}</td>
                      <td className="py-1.5">{size.waistMin || size.waistMax ? `${size.waistMin ?? ""}–${size.waistMax ?? ""}` : "—"}</td>
                      <td className="py-1.5">{size.hipsMin || size.hipsMax ? `${size.hipsMin ?? ""}–${size.hipsMax ?? ""}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">{t("noData")}</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
