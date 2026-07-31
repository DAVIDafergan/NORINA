import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/admin/guard";
import { shippingSettingSchema } from "@/lib/admin/schemas";

/** ShippingSetting is a singleton - always read/write the first row (see schema comment). */
export const PATCH = withAdmin(async (request) => {
  const body = await request.json();
  const parsed = shippingSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { flatRatePrice, freeShippingAbove } = parsed.data;

  const existing = await prisma.shippingSetting.findFirst();
  const setting = existing
    ? await prisma.shippingSetting.update({
        where: { id: existing.id },
        data: { flatRatePrice, freeShippingAbove },
      })
    : await prisma.shippingSetting.create({ data: { flatRatePrice, freeShippingAbove } });

  return NextResponse.json({ id: setting.id });
});
