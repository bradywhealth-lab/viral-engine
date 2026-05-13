import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders, enforceSameOrigin } from "@/lib/security";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth page and Next.js internals (apply security headers only)
  if (
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return applySecurityHeaders(request, NextResponse.next());
  }

  // For API routes, enforce same-origin then apply security headers
  if (pathname.startsWith("/api/")) {
    const sameOriginError = enforceSameOrigin(request);
    if (sameOriginError) {
      return applySecurityHeaders(request, sameOriginError);
    }
    return applySecurityHeaders(request, NextResponse.next());
  }

  // Check for JWT session cookie
  const session = request.cookies.get("vev-session");
  if (!session?.value) {
    // Fallback: also check legacy cookie for backward compat during transition
    const legacyAuth = request.cookies.get("vev-auth");
    if (!legacyAuth || legacyAuth.value !== "1") {
      const redirectResponse = NextResponse.redirect(new URL("/auth", request.url));
      return applySecurityHeaders(request, redirectResponse);
    }
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
