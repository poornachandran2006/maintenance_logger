import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = ["/signin", "/signup"];

// Static files, images, favicon, etc.
const staticFileRegex = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Allow static assets
  if (staticFileRegex.test(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 2️⃣ Allow signin + signup pages
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 3️⃣ Get JWT cookie
  const token = req.cookies.get("token")?.value;

  // 4️⃣ If NO TOKEN → redirect to signin
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/signin";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5️⃣ Token exists → allow access
  return NextResponse.next();
}

// This applies middleware to all routes EXCEPT static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|signin|signup).*)",
  ],
};


