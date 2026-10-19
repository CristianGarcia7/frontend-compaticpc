import { connection } from "next/server";

/**
 * Authenticated app routes render per request: proxy.ts gives them a fresh
 * CSP nonce, and Next can only stamp it on pages it renders on demand.
 * The marketing pages in app/(marketing) stay prerendered.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return children;
}
