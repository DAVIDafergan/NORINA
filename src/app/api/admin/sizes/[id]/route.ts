import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { sizeUpdateSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = sizeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  if (parsed.data.label) {
    const existing = await prisma.size.findUnique({ where: { label: parsed.data.label } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "label_in_use" }, { status: 409 });
    }
  }

  const size = await prisma.size.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id: size.id });
});

export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const variantCount = await prisma.productVariant.count({ where: { sizeId: id } });
  if (variantCount > 0) {
    return NextResponse.json(
      {
        error: "size_in_use",
        message: `לא ניתן למחוק מידה שמשויכת ל-${variantCount} וריאנטים של מוצרים`,
      },
      { status: 409 },
    );
  }

  await prisma.size.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
