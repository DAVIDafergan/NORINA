import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { pickupLocationInputSchema } from "@/lib/admin/schemas";

export const PATCH = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = pickupLocationInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const location = await prisma.pickupLocation.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ id: location.id });
});

export const DELETE = withAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    await prisma.pickupLocation.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "location_in_use", message: "לא ניתן למחוק נקודת איסוף עם הזמנות קיימות - אפשר לכבות אותה במקום" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
});
