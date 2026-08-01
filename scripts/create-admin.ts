/**
 * One-off script to create (or promote) an ADMIN user directly in the
 * database - for bootstrapping the very first admin login when the
 * dashboard has no way to create an admin yet. Not part of prisma/seed.ts
 * on purpose: seed.ts inserts demo catalog data and must never run against
 * production; this script only touches the one user row it's given.
 *
 * Usage:
 *   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="at-least-8-chars" npx tsx scripts/create-admin.ts
 *
 * Reads DATABASE_URL from the environment exactly like the app does -
 * point it at whichever database you want to affect.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    console.error(
      'Usage: ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="at-least-8-chars" npx tsx scripts/create-admin.ts',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: "ADMIN", isBlocked: false },
    create: {
      email,
      name,
      password: passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Admin user ready: ${user.email} (id: ${user.id}, role: ${user.role})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
