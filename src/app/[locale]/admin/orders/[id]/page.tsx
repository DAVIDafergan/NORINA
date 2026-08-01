import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { PrintButton } from "@/components/admin/print-button";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      pickupLocation: true,
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
              color: {
                include: {
                  images: { take: 1, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
                },
              },
              size: true,
            },
          },
        },
      },
    },
  });
  if (!order) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">הזמנה #{order.id.slice(-8)}</h1>
        <PrintButton />
      </div>

      <div className="flex items-center justify-between rounded border border-zinc-200 p-4">
        <OrderStatusSelect orderId={order.id} status={order.status} />
        <span className="text-sm text-zinc-500">{order.createdAt.toLocaleString("he-IL")}</span>
      </div>

      <section className="rounded border border-zinc-200 p-4 text-sm">
        <h2 className="mb-2 font-medium">פרטי לקוח</h2>
        <p>{order.contactName}</p>
        <p>{order.contactEmail}</p>
        <p>{order.contactPhone}</p>
        {order.user && <p className="text-zinc-500">משתמש רשום: {order.user.email}</p>}
      </section>

      <section className="rounded border border-zinc-200 p-4 text-sm">
        <h2 className="mb-2 font-medium">מסירה</h2>
        {order.deliveryType === "SHIPPING" && order.address ? (
          <p>
            {order.address.street}, {order.address.city} {order.address.zip ?? ""}
          </p>
        ) : order.pickupLocation ? (
          <p>
            נקודת איסוף: {getLocalizedText(order.pickupLocation.cityName, "he")} - {order.pickupLocation.address}
          </p>
        ) : null}
        {order.notes && <p className="mt-1 text-zinc-500">הערות: {order.notes}</p>}
      </section>

      <section className="rounded border border-zinc-200 p-4">
        <h2 className="mb-3 text-sm font-medium">פריטים</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 text-sm">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-zinc-100">
                {item.productVariant.color.images[0] && (
                  <Image
                    src={item.productVariant.color.images[0].url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{getLocalizedText(item.productVariant.product.name, "he")}</p>
                <p className="text-zinc-500">
                  {getLocalizedText(item.productVariant.color.name, "he")} &middot; {item.productVariant.size.label} &times;{" "}
                  {item.quantity}
                </p>
              </div>
              <span>{formatPrice(Number(item.priceAtPurchase) * item.quantity, "he")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-zinc-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span>משלוח</span>
            <span>{formatPrice(Number(order.shippingCost), "he")}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>סה&quot;כ</span>
            <span>{formatPrice(Number(order.totalAmount), "he")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
