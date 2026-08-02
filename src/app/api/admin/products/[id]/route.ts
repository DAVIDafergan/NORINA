import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { productInputSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = productInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ id: product.id });
});

// Hard-deletes only if nothing ever ordered this product (no OrderItem
// references any of its variants - OrderItem.productVariant has no onDelete
// override, so it's RESTRICT by default and Prisma throws before anything is
// touched). Otherwise deactivating (see PATCH above) is the only option, same
// as colors/categories/sizes/pickup-locations already work - keeps historical
// orders intact instead of silently corrupting them.
export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      {
        error: "product_in_use",
        message: "לא ניתן למחוק מוצר שכבר הוזמן בעבר - אפשר להשבית אותו (לא פעיל) במקום",
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
});
