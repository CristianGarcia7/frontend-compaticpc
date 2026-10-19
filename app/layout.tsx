import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "CompatiPC · Compatibilidad con criterio",
  description:
    "Tu espacio de diagnóstico y compatibilidad de componentes. Consulta, compara y documenta decisiones técnicas.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
