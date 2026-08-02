"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ColorManager } from "@/components/admin/color-manager";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "@/components/admin/wizard-stepper";
import { formatPrice } from "@/lib/format";
import type { ManagedImage } from "@/components/admin/image-manager";

interface SizeOption {
  id: string;
  label: string;
  orderIndex: number;
}
interface VariantSummary {
  id: string;
  sizeId: string;
  sizeLabel: string;
  stockQuantity: number;
}
interface ColorSummary {
  id: string;
  name: { he: string; fr: string; en: string };
  hexCode: string;
  orderIndex: number;
  images: ManagedImage[];
  variants: VariantSummary[];
}

export function ProductWizardSteps({
  productId,
  step,
  productName,
  basePrice,
  isActive,
  colors,
  sizes,
}: {
  productId: string;
  step: 2 | 3 | 4;
  productName: string;
  basePrice: number;
  isActive: boolean;
  colors: ColorSummary[];
  sizes: SizeOption[];
}) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);

  function goTo(nextStep: number) {
    router.push(`/admin/products/${productId}?wizard=${nextStep}`);
  }

  async function handleActivate() {
    setActivating(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setActivating(false);
    router.refresh();
  }

  const totalStock = colors.reduce((sum, c) => sum + c.variants.reduce((s, v) => s + v.stockQuantity, 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">{productName}</h1>
        <WizardStepper current={step} />
      </div>

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-ink-soft">
            הוסיפי לפחות צבע אחד עם תמונה אחת לפחות. אפשר להוסיף כמה צבעים שרוצים.
          </p>
          <ColorManager productId={productId} colors={colors} sizes={sizes} stage="images" />
          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/admin/products/${productId}`)}>
              ← חזרה לפרטי מוצר
            </Button>
            <Button type="button" disabled={colors.length === 0} onClick={() => goTo(3)}>
              הבא: מידות ומלאי ←
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-ink-soft">לכל צבע - לחצי על המידות שהמוצר מגיע בהן, ומלאי את כמות המלאי.</p>
          <ColorManager productId={productId} colors={colors} sizes={sizes} stage="sizes" />
          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button variant="secondary" type="button" onClick={() => goTo(2)}>
              ← חזרה לצבעים ותמונות
            </Button>
            <Button type="button" onClick={() => goTo(4)}>
              הבא: סיכום ופרסום ←
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div className="rounded border border-ink/12 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-xl">{productName}</h2>
              <span className="text-lg">{formatPrice(basePrice, "he")}</span>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-cream-deep">
                    {color.images[0] && (
                      <Image src={color.images[0].url} alt="" fill unoptimized className="object-cover" sizes="48px" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-ink/20" style={{ backgroundColor: color.hexCode }} />
                      <span className="font-medium">{color.name.he}</span>
                    </div>
                    {color.variants.length > 0 ? (
                      <span className="text-ink-soft">
                        {color.variants.map((v) => `${v.sizeLabel}: ${v.stockQuantity}`).join(" · ")}
                      </span>
                    ) : (
                      <span className="text-amber-600">אין מידות שנבחרו לצבע הזה</span>
                    )}
                  </div>
                </div>
              ))}
              {colors.length === 0 && <p className="text-sm text-amber-600">לא נוספו צבעים למוצר הזה עדיין.</p>}
            </div>

            <div className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">סה״כ מלאי: {totalStock} יחידות</div>
          </div>

          {!isActive && (
            <div className="flex items-center justify-between rounded border border-gold/40 bg-gold-soft/20 p-4 text-sm">
              <span>המוצר לא פעיל - לא יוצג בחנות עד שתפעילי אותו.</span>
              <Button type="button" variant="secondary" onClick={handleActivate} disabled={activating}>
                {activating ? "מפעילה..." : "הפעלת המוצר"}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <Button variant="secondary" type="button" onClick={() => goTo(3)}>
              ← חזרה למידות ומלאי
            </Button>
            <Button type="button" onClick={() => router.push("/admin/products")}>
              סיום - לרשימת המוצרים
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
