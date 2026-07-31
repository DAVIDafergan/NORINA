import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { createVerificationToken } from "@/lib/auth/tokens";
import { buildResetPasswordEmail } from "@/lib/auth/email-templates";
import { getEmailSender } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { email, locale } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the account exists, to avoid leaking which emails are registered.
  if (user && user.password) {
    const { raw, hash, expires } = createVerificationToken();
    await prisma.verificationToken.create({
      data: { identifier: `reset-password:${email}`, token: hash, expires },
    });

    const resetUrl = new URL(
      `/${locale}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`,
      request.url,
    );
    const { subject, html } = await buildResetPasswordEmail(locale, resetUrl.toString());
    await getEmailSender().send({ to: email, subject, html });
  }

  return NextResponse.json({ ok: true });
}
