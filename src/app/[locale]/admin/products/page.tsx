import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";

const LOW_STOCK_THRESHOLD = 3;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string; status?: string }>;
}) {
  const { q, categoryId, status } = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { orderIndex: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(status === "active" ? { isActive: true } : {}),
      ...(status === "inactive" ? { isActive: false } : {}),
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = q
    ? products.filter((p) => {
        const name = getLocalizedText(p.name, "he").toLowerCase();
        return name.includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase());
      })
    : products;

  const visible =
    status === "lowStock"
      ? filtered.filter((p) => p.variants.some((v) => v.stockQuantity <= LOW_STOCK_THRESHOLD))
      : filtered;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">מוצרים</h1>
        <NextLink
          href="/admin/products/new"
          className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-gold"
        >
          מוצר חדש
        </NextLink>
      </div>

      <form className="flex flex-wrap gap-3 text-sm">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם..."
          className="rounded border border-ink/20 px-3 py-2"
        />
        <select name="categoryId" defaultValue={categoryId ?? ""} className="rounded border border-ink/20 px-3 py-2">
          <option value="">כל הקטגוריות</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalizedText(category.name, "he")}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded border border-ink/20 px-3 py-2">
          <option value="">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="inactive">לא פעיל</option>
          <option value="lowStock">מלאי נמוך</option>
        </select>
        <button type="submit" className="rounded border border-ink/20 px-4 py-2 hover:bg-cream">
          סינון
        </button>
      </form>

      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-ink/12 text-ink-soft">
            <th className="py-2 text-start">שם</th>
            <th className="py-2 text-start">קטגוריה</th>
            <th className="py-2 text-start">מחיר</th>
            <th className="py-2 text-start">סטטוס</th>
            <th className="py-2 text-start">מלאי</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
            const lowStock = product.variants.some((v) => v.stockQuantity <= LOW_STOCK_THRESHOLD);
            return (
              <tr key={product.id} className="border-b border-cream-deep hover:bg-cream">
                <td className="py-3">
                  <NextLink href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                    {getLocalizedText(product.name, "he")}
                  </NextLink>
                </td>
                <td className="py-3">{getLocalizedText(product.category.name, "he")}</td>
                <td className="py-3">{formatPrice(Number(product.basePrice), "he")}</td>
                <td className="py-3">
                  <span className={product.isActive ? "text-green-700" : "text-ink/45"}>
                    {product.isActive ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
                <td className={`py-3 ${lowStock ? "text-amber-600" : ""}`}>{totalStock}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {visible.length === 0 && <p className="text-ink-soft">לא נמצאו מוצרים.</p>}
    </div>
  );
}
