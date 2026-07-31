import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { variantUpdateSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = variantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const variant = await prisma.productVariant.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ id: variant.id, stockQuantity: variant.stockQuantity });
});

export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    await prisma.productVariant.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "variant_in_use", message: "לא ניתן למחוק מידה עם הזמנות קיימות" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
});
