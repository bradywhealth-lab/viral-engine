import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth page, API routes, and Next.js internals
  if (
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check for JWT session cookie
  const session = request.cookies.get("vev-session");
  if (!session?.value) {
    // Fallback: also check legacy cookie for backward compat during transition
    const legacyAuth = request.cookies.get("vev-auth");
    if (!legacyAuth || legacyAuth.value !== "1") {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
