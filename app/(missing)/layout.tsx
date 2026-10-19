import { connection } from "next/server";

/**
 * Renders unknown URLs on demand so the 404 carries the proxy's nonce. No
 * loading.tsx in this group: a Suspense boundary would flush a 200 shell
 * before notFound() runs, and the response must keep its 404 status.
 */
export default async function MissingLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return children;
}
