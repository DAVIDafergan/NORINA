import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";

export const POST = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const source = await prisma.product.findUnique({
    where: { id },
    include: { colors: { include: { images: true } }, variants: true },
  });
  if (!source) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const baseSlug = `${source.slug}-copy`;
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const clone = await prisma.product.create({
    data: {
      slug,
      name: source.name as object,
      description: source.description as object,
      materials: source.materials ?? undefined,
      careInstructions: source.careInstructions ?? undefined,
      additionalInfo: source.additionalInfo ?? undefined,
      categoryId: source.categoryId,
      basePrice: source.basePrice,
      isActive: false,
    },
  });

  for (const color of source.colors) {
    const newColor = await prisma.color.create({
      data: {
        productId: clone.id,
        name: color.name as object,
        hexCode: color.hexCode,
        orderIndex: color.orderIndex,
        images: {
          create: color.images.map((image) => ({
            url: image.url,
            order: image.order,
            isPrimary: image.isPrimary,
          })),
        },
      },
    });

    const variantsForColor = source.variants.filter((v) => v.colorId === color.id);
    for (const variant of variantsForColor) {
      await prisma.productVariant.create({
        data: {
          productId: clone.id,
          colorId: newColor.id,
          sizeId: variant.sizeId,
          sku: `${slug}-${newColor.id.slice(-6)}-${variant.sizeId.slice(-4)}`,
          stockQuantity: 0,
          priceOverride: variant.priceOverride ?? undefined,
        },
      });
    }
  }

  return NextResponse.json({ id: clone.id });
});
