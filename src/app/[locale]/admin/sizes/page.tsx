import { prisma } from "@/lib/prisma";
import { SizeManager } from "@/components/admin/size-manager";

export default async function AdminSizesPage() {
  const sizes = await prisma.size.findMany({
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { variants: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">מידות</h1>
        <p className="mt-1 text-sm text-ink-soft">
          גררי לפי הידית כדי לשנות סדר. טווחי המידות (בס״מ) מזינים את מדריך המידות החכם בחנות - מידה בלי
          טווח פשוט לא תופיע בהמלצה.
        </p>
      </div>
      <SizeManager
        sizes={sizes.map((s) => ({
          id: s.id,
          label: s.label,
          bustMin: s.bustMin,
          bustMax: s.bustMax,
          waistMin: s.waistMin,
          waistMax: s.waistMax,
          hipsMin: s.hipsMin,
          hipsMax: s.hipsMax,
          variantCount: s._count.variants,
        }))}
      />
    </div>
  );
}
