import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { hashToken } from "@/lib/auth/tokens";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { token, email, password } = parsed.data;

  const identifier = `reset-password:${email}`;
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token: tokenHash } },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: passwordHash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier, token: tokenHash } } }),
  ]);

  return NextResponse.json({ ok: true });
}
