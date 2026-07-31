import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { variantInputSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id: colorId } = await context.params;
  const body = await request.json();
  const parsed = variantInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const input = parsed.data;

  const color = await prisma.color.findUnique({ where: { id: colorId } });
  if (!color) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const existing = await prisma.productVariant.findUnique({
    where: { colorId_sizeId: { colorId, sizeId: input.sizeId } },
  });
  if (existing) {
    return NextResponse.json({ error: "variant_exists" }, { status: 409 });
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId: color.productId,
      colorId,
      sizeId: input.sizeId,
      sku: `${color.productId.slice(-6)}-${colorId.slice(-6)}-${input.sizeId.slice(-4)}`,
      stockQuantity: input.stockQuantity,
      priceOverride: input.priceOverride ?? undefined,
    },
  });

  return NextResponse.json({ id: variant.id });
});
