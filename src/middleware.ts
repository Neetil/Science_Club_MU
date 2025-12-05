import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("admin-auth");
  const isAuthenticated = authCookie?.value === "authenticated";

  // Allow access to login page
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Add header to indicate this is the login page
    const response = NextResponse.next();
    response.headers.set("x-is-login-page", "true");
    return response;
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

