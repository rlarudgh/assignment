import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const cookieToken = request.cookies.get("auth_token")?.value;
  const _hasToken = token || cookieToken;

  // API routes - let the API handle auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // For now, we rely on client-side auth
  // Server-side token validation would require JWT secret
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
