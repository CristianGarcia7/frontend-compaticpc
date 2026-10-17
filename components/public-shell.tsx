"use client";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { ensureSession, useSession } from "../lib/session-store";
import { Brand } from "./ui";

/** Header and footer for public pages (help, landing, legal). */
export function PublicShell({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  useEffect(() => {
    ensureSession();
  }, []);
  return (
    <div className="public-page">
      <header className="public-header">
        <Link href="/" aria-label="CompatiPC, inicio">
          <Brand />
        </Link>
        <nav aria-label="Navegación pública">
          <Link href="/precios">Precios</Link>
          <Link href="/ayuda">Ayuda</Link>
          {!loading && user ? (
            <Link className="button" href="/dashboard">
              Ir a mi panel
            </Link>
          ) : (
            <Link className="button secondary" href="/login?mode=login">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </header>
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <span>CompatiPC · Compatibilidad con criterio.</span>
        <nav aria-label="Enlaces del sitio">
          <Link href="/precios">Precios</Link>
          <Link href="/ayuda">Ayuda</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
        </nav>
      </footer>
    </div>
  );
}
