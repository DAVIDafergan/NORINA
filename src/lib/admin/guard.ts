import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

export class AdminAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Used by admin API routes (the admin layout guards page rendering separately). */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new AdminAuthError(401, "unauthenticated");
  if (session.user.role !== "ADMIN") throw new AdminAuthError(403, "forbidden");
  return session;
}

/** Wraps an admin API route handler so every route doesn't repeat the same try/catch. */
export function withAdmin<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>,
) {
  return async (request: Request, ...args: Args): Promise<Response> => {
    try {
      await requireAdminSession();
    } catch (error) {
      if (error instanceof AdminAuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
    return handler(request, ...args);
  };
}
