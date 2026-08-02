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

export function getCategoryWithProducts(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          colors: {
            orderBy: { orderIndex: "asc" },
            include: { images: { orderBy: coverImageOrderBy, take: 1 } },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function getProductBySlug(slug: string) {
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
    include: {
      colors: {
        orderBy: { orderIndex: "asc" },
        include: { images: { orderBy: coverImageOrderBy, take: 1 } },
        take: 1,
      },
    },
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
