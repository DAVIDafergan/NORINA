import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalizedText } from "@/lib/i18n-text";
import { ProductForm } from "@/components/admin/product-form";
import { ColorManager } from "@/components/admin/color-manager";
import { DuplicateButton } from "@/components/admin/duplicate-button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductWizardSteps } from "@/components/admin/product-wizard-steps";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { LocalizedText } from "@/lib/types";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wizard?: string }>;
}) {
  const { id } = await params;
  const { wizard } = await searchParams;

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

  const colorsForManager = product.colors.map((color) => ({
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
  }));
  const sizesForManager = sizes.map((s) => ({ id: s.id, label: s.label, orderIndex: s.orderIndex }));

  const wizardStep = wizard === "2" || wizard === "3" || wizard === "4" ? (Number(wizard) as 2 | 3 | 4) : null;

  if (wizardStep) {
    return (
      <ProductWizardSteps
        productId={product.id}
        step={wizardStep}
        productName={getLocalizedText(product.name, "he")}
        basePrice={Number(product.basePrice)}
        isActive={product.isActive}
        colors={colorsForManager}
        sizes={sizesForManager}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        title={getLocalizedText(product.name, "he")}
        action={
          <div className="flex items-center gap-4">
            <DuplicateButton productId={product.id} />
            <DeleteProductButton productId={product.id} productName={getLocalizedText(product.name, "he")} />
          </div>
        }
      />

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
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-soft">צבעים, תמונות ומידות</h2>
        <ColorManager productId={product.id} sizes={sizesForManager} colors={colorsForManager} stage="full" />
      </div>
    </div>
  );
}
