import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";

const updateSchema = z.object({ isBlocked: z.boolean() });

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: parsed.data.isBlocked },
  });

  return NextResponse.json({ id: user.id, isBlocked: user.isBlocked });
});
