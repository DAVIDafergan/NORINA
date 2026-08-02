import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const newsletterSchema = z.object({
  email: z.string().email(),
  locale: z.enum(["he", "fr", "en"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { email, locale } = parsed.data;

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email, locale },
  });

  return NextResponse.json({ ok: true });
}
