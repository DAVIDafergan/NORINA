import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/tokens";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  const home = new URL(`/`, request.url);

  if (!token || !email) {
    return NextResponse.redirect(home);
  }

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: `verify-email:${email}`,
        token: hashToken(token),
      },
    },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(home);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier: `verify-email:${email}`, token: hashToken(token) } },
    }),
  ]);

  return NextResponse.redirect(home);
}
