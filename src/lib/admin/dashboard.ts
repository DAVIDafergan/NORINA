import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";

const COUNTED_STATUSES = ["PAID", "PACKED", "SHIPPED", "DELIVERED"] as const;
const LOW_STOCK_THRESHOLD = 3;
const CHART_DAYS = 14;

export async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(startOfToday);
  chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));

  const [todayOrdersCount, monthOrders, lowStockCount, pendingCount, recentOrders, orderItems] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.findMany({
        where: { status: { in: [...COUNTED_STATUSES] }, createdAt: { gte: startOfMonth } },
        select: { totalAmount: true },
      }),
      prisma.productVariant.count({ where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } } }),
      // "pending" here means paid orders still waiting to be packed - see DECISIONS.md stage 9
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.findMany({
        where: { status: { in: [...COUNTED_STATUSES] }, createdAt: { gte: chartStart } },
        select: { createdAt: true, totalAmount: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: { in: [...COUNTED_STATUSES] } } },
        select: {
          quantity: true,
          productVariant: { select: { product: { select: { id: true, name: true, slug: true } } } },
        },
      }),
    ]);

  const monthSales = monthOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const salesByDay = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const day = new Date(chartStart);
    day.setDate(day.getDate() + i);
    salesByDay.set(day.toISOString().slice(0, 10), 0);
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(order.totalAmount));
  }

  const productSales = new Map<string, { name: string; slug: string; quantity: number }>();
  for (const item of orderItems) {
    const product = item.productVariant.product;
    const existing = productSales.get(product.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      productSales.set(product.id, {
        name: getLocalizedText(product.name, "he"),
        slug: product.slug,
        quantity: item.quantity,
      });
    }
  }
  const hotProducts = [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return {
    todayOrdersCount,
    monthSales,
    lowStockCount,
    pendingCount,
    salesChart: [...salesByDay.entries()].map(([date, total]) => ({ date, total })),
    hotProducts,
  };
}
