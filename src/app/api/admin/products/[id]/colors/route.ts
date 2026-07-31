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

  const color = await prisma.color.create({
    data: {
      productId,
      name: input.name,
      hexCode: input.hexCode,
      images: {
        create: input.imageUrls.map((url, index) => ({ url, order: index })),
      },
    },
  });

  return NextResponse.json({ id: color.id });
});
