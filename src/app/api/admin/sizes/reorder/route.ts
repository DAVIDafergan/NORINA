import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { sizeReorderSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = sizeReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      prisma.size.update({ where: { id }, data: { orderIndex: index } }),
    ),
  );

  return NextResponse.json({ ok: true });
});
