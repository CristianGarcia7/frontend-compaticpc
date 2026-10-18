import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
export const metadata: Metadata = {
  title: "CompatiPC · Compatibilidad con criterio",
  description:
    "Tu espacio de diagnóstico y compatibilidad de componentes. Consulta, compara y documenta decisiones técnicas.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The CSP nonce from proxy.ts only reaches pages rendered per request, so
  // opt every page out of static prerendering.
  await connection();
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
