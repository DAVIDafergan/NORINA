import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { colorInputSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id: productId } = await context.params;
  const body = await request.json();
  const parsed = colorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const input = parsed.data;

  const lastColor = await prisma.color.findFirst({
    where: { productId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const color = await prisma.color.create({
    data: {
      productId,
      name: input.name,
      hexCode: input.hexCode,
      orderIndex: (lastColor?.orderIndex ?? -1) + 1,
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          order: index,
          isPrimary: image.isPrimary,
        })),
      },
    },
  });

  return NextResponse.json({ id: color.id });
});
