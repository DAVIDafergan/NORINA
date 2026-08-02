import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";
import type { LocalizedText } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">קטגוריות</h1>
        <p className="mt-1 text-sm text-ink-soft">גררי לפי הידית כדי לשנות את סדר ההצגה בחנות.</p>
      </div>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name as LocalizedText,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
