import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const accessCookieName = "marketlens_access";

export function proxy(request: NextRequest) {
  if (process.env.ENABLE_AUTH !== "true") return NextResponse.next();
  if (request.cookies.has(accessCookieName)) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = "/access";
  destination.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/research/:path*"],
};
