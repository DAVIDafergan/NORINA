import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { pickupLocationInputSchema } from "@/lib/admin/schemas";

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = pickupLocationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const location = await prisma.pickupLocation.create({ data: parsed.data });
  return NextResponse.json({ id: location.id });
});
