/**
 * Browser security headers for every page.
 *
 * The CSP is nonce-based and therefore built per request in `proxy.ts`; the
 * static headers are attached to all routes from `next.config.ts`.
 */

export type CspOptions = { nonce: string; isDev: boolean };

/** Unpredictable per-request nonce (128 bits, base64). */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Strict CSP for Next's App Router.
 *
 * - Scripts: Next reads the nonce from this header during dynamic rendering
 *   and stamps it on its own scripts; 'strict-dynamic' lets those load chunks.
 *   React needs 'unsafe-eval' only for dev tooling, never in production.
 * - API calls stay same-origin: the browser calls `/api/*` and Next rewrites
 *   them to `API_URL`, so connect-src needs no backend origin.
 * - Styles: own CSS plus the Google Fonts stylesheet imported in globals.css.
 *   Inline style *attributes* (React `style` props, e.g. progress bars) cannot
 *   carry a nonce, so only `style-src-attr` allows 'unsafe-inline'; they cannot
 *   execute script.
 */
export function buildContentSecurityPolicy({ nonce, isDev }: CspOptions): string {
  const directives: [string, ...string[]][] = [
    ["default-src", "'self'"],
    [
      "script-src",
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    ["style-src", "'self'", `'nonce-${nonce}'`, "https://fonts.googleapis.com"],
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
