import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { categoryInputSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "slug_in_use" }, { status: 409 });
  }

  const lastCategory = await prisma.category.findFirst({
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const category = await prisma.category.create({
    data: { ...parsed.data, orderIndex: (lastCategory?.orderIndex ?? -1) + 1 },
  });

  return NextResponse.json({ id: category.id });
});
