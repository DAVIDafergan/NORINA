import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">מוצר חדש</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: getLocalizedText(c.name, "he") }))}
      />
    </div>
  );
}
