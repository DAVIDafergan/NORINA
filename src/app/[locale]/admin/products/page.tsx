import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";
import { QuickStockButton } from "@/components/admin/quick-stock-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

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
    include: { category: true, variants: { include: { size: true, color: true } } },
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
      <AdminPageHeader
        title="מוצרים"
        description={`${visible.length} מוצרים`}
        action={
          <NextLink
            href="/admin/products/new"
            className="block min-h-11 rounded-sm bg-ink px-5 py-2.5 text-center text-sm font-medium text-cream transition-colors hover:bg-gold"
          >
            מוצר חדש
          </NextLink>
        }
      />

      <form className="flex flex-col gap-3 rounded-md border border-line bg-white p-4 text-sm shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם..."
          className="w-full rounded border border-ink/20 px-3 py-2.5 focus:border-gold focus:outline-none sm:w-auto"
        />
        <select name="categoryId" defaultValue={categoryId ?? ""} className="w-full rounded border border-ink/20 px-3 py-2.5 sm:w-auto">
          <option value="">כל הקטגוריות</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalizedText(category.name, "he")}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="w-full rounded border border-ink/20 px-3 py-2.5 sm:w-auto">
          <option value="">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="inactive">לא פעיל</option>
          <option value="lowStock">מלאי נמוך</option>
        </select>
        <button type="submit" className="min-h-11 w-full rounded-sm bg-ink px-4 py-2.5 text-cream transition-colors hover:bg-gold sm:w-auto">
          סינון
        </button>
      </form>

      <div className="hidden overflow-x-auto rounded-md border border-line bg-white p-2 shadow-sm md:block">
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
                  <td className="py-3">
                    <QuickStockButton
                      productName={getLocalizedText(product.name, "he")}
                      totalStock={totalStock}
                      lowStock={lowStock}
                      variants={product.variants.map((v) => ({
                        id: v.id,
                        sizeLabel: v.size.label,
                        colorName: getLocalizedText(v.color.name, "he"),
                        stockQuantity: v.stockQuantity,
                      }))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((product) => {
          const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
          const lowStock = product.variants.some((v) => v.stockQuantity <= LOW_STOCK_THRESHOLD);
          return (
            <div key={product.id} className="rounded-md border border-line bg-white shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <NextLink href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                  {getLocalizedText(product.name, "he")}
                </NextLink>
                <span className={`shrink-0 text-xs ${product.isActive ? "text-green-700" : "text-ink/45"}`}>
                  {product.isActive ? "פעיל" : "לא פעיל"}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {getLocalizedText(product.category.name, "he")} · {formatPrice(Number(product.basePrice), "he")}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-ink-soft">מלאי:</span>
                <QuickStockButton
                  productName={getLocalizedText(product.name, "he")}
                  totalStock={totalStock}
                  lowStock={lowStock}
                  variants={product.variants.map((v) => ({
                    id: v.id,
                    sizeLabel: v.size.label,
                    colorName: getLocalizedText(v.color.name, "he"),
                    stockQuantity: v.stockQuantity,
                  }))}
                />
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && <p className="text-ink-soft">לא נמצאו מוצרים.</p>}
    </div>
  );
}
