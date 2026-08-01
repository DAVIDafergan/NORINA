import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductForm } from "@/components/admin/product-form";
import { ColorManager } from "@/components/admin/color-manager";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import type { LocalizedText } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, sizes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        colors: {
          orderBy: { orderIndex: "asc" },
          include: { images: { orderBy: { order: "asc" } }, variants: { include: { size: true } } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.size.findMany({ orderBy: { orderIndex: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{getLocalizedText(product.name, "he")}</h1>
        <DuplicateButton productId={product.id} />
      </div>

      <ProductForm
        productId={product.id}
        categories={categories.map((c) => ({ id: c.id, name: getLocalizedText(c.name, "he") }))}
        initial={{
          name: product.name as LocalizedText,
          description: product.description as LocalizedText,
          materials: (product.materials as LocalizedText | null) ?? undefined,
          careInstructions: (product.careInstructions as LocalizedText | null) ?? undefined,
          additionalInfo: (product.additionalInfo as LocalizedText | null) ?? undefined,
          categoryId: product.categoryId,
          basePrice: Number(product.basePrice),
          isActive: product.isActive,
        }}
      />

      <div>
        <h2 className="mb-4 text-xl font-semibold">צבעים, תמונות ומידות</h2>
        <ColorManager
          productId={product.id}
          sizes={sizes.map((s) => ({ id: s.id, label: s.label, orderIndex: s.orderIndex }))}
          colors={product.colors.map((color) => ({
            id: color.id,
            name: color.name as LocalizedText,
            hexCode: color.hexCode,
            orderIndex: color.orderIndex,
            images: color.images.map((image) => ({ id: image.id, url: image.url, isPrimary: image.isPrimary })),
            variants: color.variants.map((variant) => ({
              id: variant.id,
              sizeId: variant.sizeId,
              sizeLabel: variant.size.label,
              stockQuantity: variant.stockQuantity,
            })),
          }))}
        />
      </div>
    </div>
  );
}
