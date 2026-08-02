import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { LocalizedText } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="קטגוריות" description="גררי לפי הידית כדי לשנות את סדר ההצגה בחנות." />
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
