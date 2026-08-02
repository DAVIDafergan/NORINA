import NextLink from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const COUNTED_STATUSES = ["PAID", "PACKED", "SHIPPED", "DELIVERED"];

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { totalAmount: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">משתמשים</h1>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-ink/12 text-ink-soft">
              <th className="py-2 text-start">שם</th>
              <th className="py-2 text-start">דוא&quot;ל</th>
              <th className="py-2 text-start">הצטרפות</th>
              <th className="py-2 text-start">הזמנות</th>
              <th className="py-2 text-start">סה&quot;כ הוצאה</th>
              <th className="py-2 text-start">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const counted = user.orders.filter((o) => COUNTED_STATUSES.includes(o.status));
              const totalSpent = counted.reduce((sum, o) => sum + Number(o.totalAmount), 0);
              return (
                <tr key={user.id} className="border-b border-cream-deep hover:bg-cream">
                  <td className="py-3">
                    <NextLink href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                      {user.name ?? "—"}
                    </NextLink>
                  </td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">{user.createdAt.toLocaleDateString("he-IL")}</td>
                  <td className="py-3">{counted.length}</td>
                  <td className="py-3">{formatPrice(totalSpent, "he")}</td>
                  <td className="py-3">
                    {user.isBlocked ? <span className="text-red-600">חסום</span> : <span className="text-green-700">פעיל</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {users.map((user) => {
          const counted = user.orders.filter((o) => COUNTED_STATUSES.includes(o.status));
          const totalSpent = counted.reduce((sum, o) => sum + Number(o.totalAmount), 0);
          return (
            <NextLink
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="block rounded border border-ink/12 p-4 hover:bg-cream"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{user.name ?? "—"}</span>
                {user.isBlocked ? (
                  <span className="shrink-0 text-xs text-red-600">חסום</span>
                ) : (
                  <span className="shrink-0 text-xs text-green-700">פעיל</span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-ink-soft">
                <span>הצטרפות: {user.createdAt.toLocaleDateString("he-IL")}</span>
                <span>
                  {counted.length} הזמנות · {formatPrice(totalSpent, "he")}
                </span>
              </div>
            </NextLink>
          );
        })}
      </div>

      {users.length === 0 && <p className="text-ink-soft">אין משתמשים רשומים עדיין.</p>}
    </div>
  );
}
