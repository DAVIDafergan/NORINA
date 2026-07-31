import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { productInputSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/slugify";

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const input = parsed.data;

  const baseSlug = slugify(input.name.en || input.name.he);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      isActive: input.isActive,
    },
  });

  return NextResponse.json({ id: product.id });
});
