const BASE = "http://compatipc.local";

/**
 * Returns a same-origin relative path for post-login redirects, or the
 * fallback. Rejects absolute URLs, protocol-relative ("//host") and
 * backslash tricks ("/\host"), control characters and the login page itself.
 */
export function safeNext(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value || !value.startsWith("/") || value.length > 512) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE || url.pathname.startsWith("/login"))
      return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** Builds /login?next=… for a protected path. */
export const loginWithNext = (path: string) =>
  path && path !== "/" && !path.startsWith("/login")
    ? `/login?next=${encodeURIComponent(path)}`
    : "/login";
