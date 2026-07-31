import { prisma } from "@/lib/prisma";

export function getActiveCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "asc" },
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
            include: { images: { orderBy: { order: "asc" }, take: 1 } },
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
        include: { images: { orderBy: { order: "asc" } } },
      },
      variants: {
        include: { size: true },
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
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
        take: 1,
      },
    },
  });
}
