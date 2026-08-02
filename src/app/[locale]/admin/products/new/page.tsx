import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">מוצר חדש</h1>
      <p className="max-w-xl rounded-sm border border-line bg-cream-deep/50 px-4 py-3 text-sm text-ink/70">
        אחרי שמירת הפרטים הבסיסיים כאן, יופיע עמוד עריכת המוצר שבו מוסיפים צבעים, תמונות ומידות עם מלאי.
      </p>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: getLocalizedText(c.name, "he") }))}
      />
    </div>
  );
}
