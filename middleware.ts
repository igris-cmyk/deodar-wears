import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasLikelySessionCookie, isTrustedOrigin } from "@/modules/auth/security";

const protectedPrefixes = ["/account", "/admin", "/preview"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

    if (!isTrustedOrigin(origin, [appUrl])) {
      return NextResponse.json(
        { error: { code: "PERMISSION_DENIED", message: "Origin is not trusted." } },
        { status: 403 },
      );
    }
  }

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const hasSession = hasLikelySessionCookie(request.headers.get("cookie"));

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/preview/:path*", "/api/:path*"],
};
