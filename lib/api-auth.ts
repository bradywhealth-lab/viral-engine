import { getSessionFromCookie, type JwtPayload } from "@/lib/auth";

/**
 * Get the authenticated user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<JwtPayload | null> {
  return getSessionFromCookie();
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
