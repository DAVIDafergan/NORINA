import { notFound } from "next/navigation";
import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/admin/order-status";
import { BlockUserButton } from "@/components/admin/block-user-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

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
      <AdminPageHeader
        title={user.name ?? user.email}
        description={user.name ? user.email : undefined}
        action={<BlockUserButton userId={user.id} isBlocked={user.isBlocked} />}
      />

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-soft">היסטוריית הזמנות</h2>

        <div className="hidden overflow-x-auto rounded-md border border-line bg-white p-2 shadow-sm sm:block">
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
        </div>

        <div className="flex flex-col gap-2 sm:hidden">
          {user.orders.map((order) => (
            <NextLink
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded-md border border-line bg-white shadow-sm p-3 text-sm transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-mono text-xs text-ink-soft">#{order.id.slice(-8)}</p>
                <p className="mt-1">{order.createdAt.toLocaleDateString("he-IL")}</p>
              </div>
              <div className="text-end">
                <p className="font-medium">{formatPrice(Number(order.totalAmount), "he")}</p>
                <span className={`mt-1 inline-block rounded px-2 py-1 text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </NextLink>
          ))}
        </div>

        {user.orders.length === 0 && <p className="text-ink-soft">אין עדיין הזמנות.</p>}
      </section>
    </div>
  );
}
