import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Página no encontrada · CompatiPC",
};

/**
 * Unknown URLs land here instead of Next's prerendered 404: proxy.ts gives
 * them the per-request nonce CSP, and the (missing) layout renders this route
 * on demand, so the not-found page carries that nonce. The root not-found
 * must stay static, otherwise every page (including marketing) turns dynamic.
 */
export default function Missing() {
  notFound();
}
