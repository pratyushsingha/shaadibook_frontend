import { NextResponse } from "next/server";

const protectedRoutes = ["/", "/dashboard/:path*"];

export function middleware(request) {
  const refreshToken = request.cookies.get("refreshToken");

  if (!refreshToken && protectedRoutes.includes(request.nextUrl.pathname)) {
    const absoluteUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(absoluteUrl.toString());
  }

  if (refreshToken && request.nextUrl.pathname === "/login") {
    const absoluteUrl = new URL("/dashboard", request.nextUrl.origin);
    return NextResponse.redirect(absoluteUrl.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
