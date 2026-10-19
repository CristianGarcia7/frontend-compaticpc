import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { MANIFEST_FILE, parseManifest } from "./lib/csp-hashes";
import { cspForRequest, type HashManifest } from "./lib/security-headers";

let manifest: HashManifest | null | undefined;

/** Hashes written by scripts/csp-hashes.mjs after `next build`; read once. */
function loadManifest(): HashManifest | null {
  if (manifest !== undefined) return manifest;
  try {
    manifest = parseManifest(readFileSync(path.join(process.cwd(), ".next", MANIFEST_FILE), "utf8"));
  } catch {
    manifest = null;
  }
  if (!manifest) {
    console.error(`proxy: .next/${MANIFEST_FILE} missing or invalid; static pages get a hash-less CSP.`);
  }
  return manifest;
}

/**
 * Per-request CSP. Static marketing pages get the build-time hash policy and
 * no nonce, so Next keeps serving their prerendered HTML. Every other page
 * gets a fresh nonce: Next extracts it from the request's CSP header while
 * rendering and applies it to its scripts.
 */
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const { csp, nonce } = cspForRequest({
    pathname: request.nextUrl.pathname,
    isDev,
    manifest: isDev ? null : loadManifest(),
  });

  let response: NextResponse;
  if (nonce) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Content-Security-Policy", csp);
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next();
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API rewrites, static assets and the icon need no CSP.
      // Each exclusion ends in "/" or "$" so look-alikes such as /apix keep it.
      source: "/((?!api/|api$|_next/static/|_next/image|favicon\\.ico$|icon\\.svg$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
