/**
 * Browser security headers for every page.
 *
 * Two Content-Security-Policy shapes, chosen per request in `proxy.ts`:
 * - static marketing pages are prerendered at build time, so their inline
 *   scripts are allowed by sha256 hashes computed after the build
 *   (`scripts/csp-hashes.mjs`) and the HTML carries no nonce;
 * - every other page renders per request with a fresh nonce.
 * The other headers are attached to all routes from `next.config.ts`.
 */

export type CspOptions = { nonce: string; isDev: boolean };
export type RouteHashes = { scripts: string[]; styles: string[] };
export type HashManifest = Record<string, RouteHashes>;

/**
 * Public pages that are prerendered (route group `app/(marketing)`). Exact
 * paths only: look-alikes such as /precios-x fall under the nonce policy.
 */
export const STATIC_ROUTES: readonly string[] = [
  "/",
  "/precios",
  "/ayuda",
  "/terminos",
  "/privacidad",
];

export function isStaticRoute(pathname: string): boolean {
  return STATIC_ROUTES.includes(pathname);
}

/** Unpredictable per-request nonce (128 bits, base64). */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

type Directive = [string, ...string[]];

/**
 * Directives shared by both policies.
 *
 * - API calls stay same-origin: the browser calls `/api/*` and Next rewrites
 *   them to `API_URL`, so connect-src needs no backend origin.
 * - Styles: own CSS plus the Google Fonts stylesheet imported in globals.css.
 *   Inline style *attributes* (React `style` props, e.g. progress bars) cannot
 *   carry a nonce or hash, so only `style-src-attr` allows 'unsafe-inline';
 *   they cannot execute script.
 */
function policy(script: string[], style: string[], isDev: boolean): string {
  const directives: Directive[] = [
    ["default-src", "'self'"],
    ["script-src", "'self'", ...script],
    ["style-src", "'self'", ...style],
    ["style-src-attr", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:"],
    ["font-src", "'self'", "https://fonts.gstatic.com"],
    ["connect-src", "'self'"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["frame-ancestors", "'none'"],
  ];
  // Dev runs on plain http://127.0.0.1; upgrading would break it.
  if (!isDev) directives.push(["upgrade-insecure-requests"]);
  return directives.map((d) => d.join(" ")).join("; ");
}

/**
 * Nonce policy for pages rendered per request. Next reads the nonce from the
 * request's CSP header while rendering and stamps it on its own scripts;
 * 'strict-dynamic' lets those load chunks. React needs 'unsafe-eval' only for
 * dev tooling, never in production.
 */
export function buildContentSecurityPolicy({ nonce, isDev }: CspOptions): string {
  return policy(
    [`'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    [`'nonce-${nonce}'`, "https://fonts.googleapis.com"],
    isDev,
  );
}

/**
 * Hash policy for prerendered pages: 'self' admits Next's external chunks
 * (no 'strict-dynamic', which would ignore 'self'), and each inline script or
 * style of the built HTML is admitted by its sha256 hash. No nonce, because
 * the same HTML is served to every visitor.
 */
export function buildStaticContentSecurityPolicy({ scripts, styles }: RouteHashes): string {
  return policy(scripts, ["https://fonts.googleapis.com", ...styles], false);
}

/**
 * Pick the policy for one request. A static route whose hashes are missing
 * (manifest absent or stale) still gets a strict policy: the page renders
 * without hydrating rather than loosening the CSP.
 */
export function cspForRequest({
  pathname,
  isDev,
  manifest,
}: {
  pathname: string;
  isDev: boolean;
  manifest: HashManifest | null;
}): { csp: string; nonce: string | null } {
  if (!isDev && isStaticRoute(pathname)) {
    const hashes = manifest?.[pathname] ?? { scripts: [], styles: [] };
    return { csp: buildStaticContentSecurityPolicy(hashes), nonce: null };
  }
  const nonce = createNonce();
  return { csp: buildContentSecurityPolicy({ nonce, isDev }), nonce };
}

const deniedFeatures = [
  "camera",
  "microphone",
  "geolocation",
  "payment",
  "usb",
  "serial",
  "hid",
  "magnetometer",
  "gyroscope",
  "accelerometer",
  "display-capture",
  "browsing-topics",
];

/** Headers that do not depend on the request. */
export const securityHeaders: { key: string; value: string }[] = [
  // No preload: the domain is not submitted to the HSTS preload list.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Legacy twin of CSP frame-ancestors 'none'.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: deniedFeatures.map((f) => `${f}=()`).join(", ") },
];
