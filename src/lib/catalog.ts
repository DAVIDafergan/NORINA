import { prisma } from "@/lib/prisma";

// Cover-image ordering for contexts that show a single thumbnail (product
// cards, order line items): the color's marked-primary image first, falling
// back to manual gallery order if none is marked.
const coverImageOrderBy = [{ isPrimary: "desc" as const }, { order: "asc" as const }];

export function getActiveCategories() {
  return prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
  });
}

/** Categories with a few of their own real products - used by the header's
 * mega menu. There's no subcategory/taxonomy model in the schema (categories
 * are flat - see DECISIONS.md stage 2), so the panel shows actual products
 * instead of inventing subcategory names that don't exist anywhere. */
export function getCategoriesWithPreview(previewCount = 3) {
  return prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: previewCount,
        include: {
          colors: {
            orderBy: { orderIndex: "asc" },
            include: { images: { orderBy: coverImageOrderBy, take: 1 } },
            take: 1,
          },
        },
      },
    },
  });
}

// Next.js route params for [slug] segments arrive percent-encoded as-is in
// this environment (they are NOT auto-decoded - see AGENTS.md re: breaking
// changes), so a Hebrew-only product/category name (a very normal admin
// input) 404s unless decoded here. Safe no-op for already-decoded/ASCII
// slugs - slugify() never lets a slug contain a literal "%".
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// Full colors (cover image only, not the whole gallery) + variants - lets
// product cards on this page offer a quick-add color/size picker without
// navigating to the product page first.
const cardQuickAddInclude = {
  colors: {
    orderBy: { orderIndex: "asc" as const },
    include: { images: { orderBy: coverImageOrderBy, take: 1 } },
  },
  variants: { include: { size: true } },
};

export function getCategoryWithProducts(rawSlug: string) {
  const slug = decodeSlug(rawSlug);
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: cardQuickAddInclude,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function getProductBySlug(rawSlug: string) {
  const slug = decodeSlug(rawSlug);
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      colors: {
        orderBy: { orderIndex: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
      variants: {
        include: { size: true },
      },
    },
  });
}

export function searchProducts(query: string, take = 24) {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: (["he", "fr", "en"] as const).map((loc) => ({
        name: { path: [loc], string_contains: q, mode: "insensitive" as const },
      })),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: cardQuickAddInclude,
  });
}

export function getNewArrivals(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      colors: {
        orderBy: { orderIndex: "asc" },
        include: { images: { orderBy: coverImageOrderBy, take: 1 } },
        take: 1,
      },
    },
  });
}
