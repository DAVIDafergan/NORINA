import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_ORDER } from "@/lib/admin/order-status";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { OrderStatus } from "@/generated/prisma/enums";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as OrderStatus } : {},
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="הזמנות" description={`${orders.length} הזמנות`} />

      <form className="flex flex-col gap-3 rounded-md border border-line bg-white p-4 text-sm shadow-sm sm:flex-row sm:items-center">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="w-full rounded border border-ink/20 px-3 py-2.5 focus:border-gold focus:outline-none sm:w-auto"
        >
          <option value="">כל הסטטוסים</option>
          {ORDER_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="min-h-11 w-full rounded-sm bg-ink px-4 py-2.5 text-cream transition-colors hover:bg-gold sm:w-auto">
          סינון
        </button>
      </form>

      <div className="hidden overflow-x-auto rounded-md border border-line bg-white p-2 shadow-sm md:block">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-ink/12 text-ink-soft">
              <th className="py-2 text-start">מס&apos; הזמנה</th>
              <th className="py-2 text-start">תאריך</th>
              <th className="py-2 text-start">לקוח</th>
              <th className="py-2 text-start">פריטים</th>
              <th className="py-2 text-start">סה&quot;כ</th>
              <th className="py-2 text-start">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-cream-deep hover:bg-cream">
                <td className="py-3">
                  <NextLink href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:underline">
                    {order.id.slice(-8)}
                  </NextLink>
                </td>
                <td className="py-3">{order.createdAt.toLocaleDateString("he-IL")}</td>
                <td className="py-3">{order.contactName}</td>
                <td className="py-3">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td className="py-3">{formatPrice(Number(order.totalAmount), "he")}</td>
                <td className="py-3">
                  <span className={`rounded px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <NextLink
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block rounded-md border border-line bg-white shadow-sm transition-shadow hover:shadow-md p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-ink-soft">#{order.id.slice(-8)}</span>
              <span className={`rounded px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="mt-2 font-medium">{order.contactName}</p>
            <div className="mt-1 flex items-center justify-between text-sm text-ink-soft">
              <span>
                {order.createdAt.toLocaleDateString("he-IL")} · {order.items.reduce((sum, i) => sum + i.quantity, 0)} פריטים
              </span>
              <span className="font-medium text-ink">{formatPrice(Number(order.totalAmount), "he")}</span>
            </div>
          </NextLink>
        ))}
      </div>

      {orders.length === 0 && <p className="text-ink-soft">אין הזמנות עדיין.</p>}
    </div>
  );
}
