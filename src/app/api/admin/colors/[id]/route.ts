import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { colorInputSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = colorInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { imageUrls, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.color.update({ where: { id }, data: rest });
    if (imageUrls) {
      await tx.colorImage.deleteMany({ where: { colorId: id } });
      await tx.colorImage.createMany({
        data: imageUrls.map((url, index) => ({ colorId: id, url, order: index })),
      });
    }
  });

  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    await prisma.color.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "color_in_use", message: "לא ניתן למחוק צבע עם הזמנות קיימות" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
});
