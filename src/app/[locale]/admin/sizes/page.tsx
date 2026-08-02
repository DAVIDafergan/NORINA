import { prisma } from "@/lib/prisma";
import { SizeManager } from "@/components/admin/size-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminSizesPage() {
  const sizes = await prisma.size.findMany({
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { variants: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="מידות"
        description="גררי לפי הידית כדי לשנות סדר. טווחי המידות (בס״מ) מזינים את מדריך המידות החכם בחנות - מידה בלי טווח פשוט לא תופיע בהמלצה."
      />
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
