import NextLink from "next/link";
import { getDashboardData } from "@/lib/admin/dashboard";
import { formatPrice } from "@/lib/format";
import { KpiCard } from "@/components/admin/kpi-card";
import { SalesChart } from "@/components/admin/sales-chart";

export default async function AdminHomePage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">דשבורד</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="הזמנות היום" value={data.todayOrdersCount.toString()} />
        <KpiCard label="מכירות החודש" value={formatPrice(data.monthSales, "he")} />
        <KpiCard label="מלאי נמוך" value={data.lowStockCount.toString()} />
        <KpiCard label="ממתינות לטיפול (שולמו, טרם נארזו)" value={data.pendingCount.toString()} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">מכירות - 14 יום אחרונים</h2>
        <SalesChart data={data.salesChart} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">מוצרים חמים</h2>
        {data.hotProducts.length === 0 ? (
          <p className="text-ink-soft">אין עדיין מספיק נתוני מכירה.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.hotProducts.map((product) => (
              <li key={product.slug} className="flex items-center justify-between text-sm">
                <NextLink href={`/product/${product.slug}`} className="hover:underline" target="_blank">
                  {product.name}
                </NextLink>
                <span className="text-ink-soft">{product.quantity} נמכרו</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
