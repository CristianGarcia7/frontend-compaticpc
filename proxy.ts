import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy, createNonce } from "./lib/security-headers";

/**
 * Per-request nonce CSP. Next extracts the nonce from the request's CSP header
 * while rendering and applies it to its scripts, so pages must render
 * dynamically (see the root layout).
 */
export function proxy(request: NextRequest) {
  const csp = buildContentSecurityPolicy({
    nonce: createNonce(),
    isDev: process.env.NODE_ENV === "development",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API rewrites, static assets and the icon need no CSP.
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
