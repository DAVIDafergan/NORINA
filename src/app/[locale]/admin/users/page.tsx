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

      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
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
              <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50">
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

      {users.length === 0 && <p className="text-zinc-500">אין משתמשים רשומים עדיין.</p>}
    </div>
  );
}
