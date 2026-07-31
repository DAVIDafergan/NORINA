import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/auth/schemas";
import { createVerificationToken } from "@/lib/auth/tokens";
import { buildVerifyEmail } from "@/lib/auth/email-templates";
import { getEmailSender } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { name, email, password, locale } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email_in_use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, password: passwordHash },
  });

  const { raw, hash, expires } = createVerificationToken();
  await prisma.verificationToken.create({
    data: { identifier: `verify-email:${email}`, token: hash, expires },
  });

  const verifyUrl = new URL(
    `/api/auth/verify-email?token=${raw}&email=${encodeURIComponent(email)}`,
    request.url,
  );
  const { subject, html } = await buildVerifyEmail(locale, verifyUrl.toString());
  await getEmailSender().send({ to: email, subject, html });

  return NextResponse.json({ ok: true });
}
