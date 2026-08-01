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
  const { images, ...rest } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.color.update({ where: { id }, data: rest });
    if (images) {
      await tx.colorImage.deleteMany({ where: { colorId: id } });
      await tx.colorImage.createMany({
        data: images.map((image, index) => ({
          colorId: id,
          url: image.url,
          order: index,
          isPrimary: image.isPrimary,
        })),
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
