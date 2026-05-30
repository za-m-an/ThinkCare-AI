import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decode JWT payload without verifying signature (safe for routing redirects, 
// secure verify is done in API routes)
function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const user = token ? decodeJWT(token) : null;

  // Protect Admin Dashboard
  if (pathname.startsWith("/admin/dashboard")) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect Admin Login (redirect to dashboard if already logged in as admin)
  if (pathname === "/admin/login") {
    if (user && user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Protect General User routes
  const protectedRoutes = ["/dashboard", "/profile", "/chat", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!user || user.role !== "USER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Force onboarding if not completed (unless they are already on /onboarding)
    // Wait! Let's check onboarding status. In Next.js middleware, we can fetch
    // the user status from the DB, but since DB call inside middleware is heavy, 
    // we can encode the onboarding state into the JWT payload, or we can fetch 
    // it or just rely on API endpoints to handle it, or we can check token. 
    // In our login token payload we didn't store isOnboarded directly, but we can 
    // easily fetch it from the database or check user info.
    // Wait, let's keep it simple: the dashboard/chat page will check if the user
    // is onboarded via the API and redirect to /onboarding in the browser, which 
    // is extremely standard, fast, and robust! That avoids DB queries in middleware.
  }

  // Redirect logged in general users from login/register to dashboard
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    if (user && user.role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
