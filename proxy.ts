import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

// We use a separate NextAuth instance for Proxy to avoid importing Prisma
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;

  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnboarding = nextUrl.pathname.startsWith("/onboarding");
  const isProtected = isDashboard || isOnboarding;

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
