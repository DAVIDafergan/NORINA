import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { colorReorderSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id: productId } = await context.params;
  const body = await request.json();
  const parsed = colorReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((colorId, index) =>
      prisma.color.update({
        where: { id: colorId, productId },
        data: { orderIndex: index },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
});
