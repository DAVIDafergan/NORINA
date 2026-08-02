import NextLink from "next/link";
import { getDashboardData } from "@/lib/admin/dashboard";
import { formatPrice } from "@/lib/format";
import { KpiCard } from "@/components/admin/kpi-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminHomePage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="דשבורד" description="תמונת מצב מהירה על החנות שלך." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="הזמנות היום" value={data.todayOrdersCount.toString()} accent />
        <KpiCard label="מכירות החודש" value={formatPrice(data.monthSales, "he")} accent />
        <KpiCard label="מלאי נמוך" value={data.lowStockCount.toString()} />
        <KpiCard label="ממתינות לטיפול (שולמו, טרם נארזו)" value={data.pendingCount.toString()} />
      </div>

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-soft">
          מכירות - 14 יום אחרונים
        </h2>
        <SalesChart data={data.salesChart} />
      </div>

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-soft">מוצרים חמים</h2>
        {data.hotProducts.length === 0 ? (
          <p className="text-ink-soft">אין עדיין מספיק נתוני מכירה.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {data.hotProducts.map((product) => (
              <li key={product.slug} className="flex items-center justify-between py-2.5 text-sm">
                <NextLink href={`/product/${product.slug}`} className="hover:text-gold hover:underline" target="_blank">
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
