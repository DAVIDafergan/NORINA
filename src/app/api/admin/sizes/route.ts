import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { sizeInputSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = sizeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const existing = await prisma.size.findUnique({ where: { label: parsed.data.label } });
  if (existing) {
    return NextResponse.json({ error: "label_in_use" }, { status: 409 });
  }

  const lastSize = await prisma.size.findFirst({
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const size = await prisma.size.create({
    data: { ...parsed.data, orderIndex: (lastSize?.orderIndex ?? -1) + 1 },
  });

  return NextResponse.json({ id: size.id });
});
