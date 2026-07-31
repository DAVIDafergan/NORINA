import { randomBytes, createHash } from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export function createVerificationToken() {
  const raw = randomBytes(32).toString("hex");
  const hash = hashToken(raw);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  return { raw, hash, expires };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
