import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { categoryInputSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = categoryInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  if (parsed.data.slug) {
    const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "slug_in_use" }, { status: 409 });
    }
  }

  const category = await prisma.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id: category.id });
});

export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      {
        error: "category_in_use",
        message: `לא ניתן למחוק קטגוריה עם ${productCount} מוצרים משויכים - יש לשייך אותם לקטגוריה אחרת קודם`,
      },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
