const BASE = "http://compatipc.local";

/**
 * Returns a same-origin relative path for post-login redirects, or the
 * fallback.
 *
 * The decision is made on the URL *after* parsing: `new URL()` resolves dot
 * segments and percent-encoded dots, so inputs like `/..//evil.com`,
 * `/a/..//evil.com` or `/%2e//evil.com` normalize to the protocol-relative
 * path `//evil.com`, which a browser would follow off-site. Raw-string checks
 * alone are not enough.
 */
export function safeNext(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof value !== "string" || value.length > 512) return fallback;
  if (!value.startsWith("/")) return fallback;
  // Control characters and backslashes (browsers treat "\" like "/").
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  const path = url.pathname;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path === "/login" || path.startsWith("/login/")) return fallback;
  return `${path}${url.search}${url.hash}`;
}

/**
 * Builds the login URL for a protected path (path plus query string). It
 * always opens the sign-in tab: whoever is sent here already has an account.
 */
export const loginWithNext = (path: string) =>
  path && path !== "/" && !path.startsWith("/login")
    ? `/login?mode=login&next=${encodeURIComponent(path)}`
    : "/login?mode=login";
