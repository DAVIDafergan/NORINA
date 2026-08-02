import { notFound } from "next/navigation";
import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/admin/order-status";
import { BlockUserButton } from "@/components/admin/block-user-button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{user.name ?? user.email}</h1>
          <p className="text-sm text-ink-soft">{user.email}</p>
        </div>
        <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium">היסטוריית הזמנות</h2>
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-ink/12 text-ink-soft">
              <th className="py-2 text-start">מס&apos;</th>
              <th className="py-2 text-start">תאריך</th>
              <th className="py-2 text-start">סה&quot;כ</th>
              <th className="py-2 text-start">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {user.orders.map((order) => (
              <tr key={order.id} className="border-b border-cream-deep">
                <td className="py-2">
                  <NextLink href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:underline">
                    {order.id.slice(-8)}
                  </NextLink>
                </td>
                <td className="py-2">{order.createdAt.toLocaleDateString("he-IL")}</td>
                <td className="py-2">{formatPrice(Number(order.totalAmount), "he")}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {user.orders.length === 0 && <p className="text-ink-soft">אין עדיין הזמנות.</p>}
      </section>
    </div>
  );
}
