import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "../components/public-shell";

export const metadata: Metadata = {
  title: "Página no encontrada · CompatiPC",
};

export default function NotFound() {
  return (
    <PublicShell>
      <section className="not-found">
        <span className="eyebrow">ERROR 404</span>
        <h1>No encontramos esta página.</h1>
        <p>
          Es posible que el enlace esté incompleto o que la página haya cambiado
          de lugar.
        </p>
        <nav aria-label="Enlaces útiles" className="button-row">
          <Link className="button" href="/">
            Ir al inicio
          </Link>
          <Link className="button secondary" href="/dashboard">
            Ir a mi panel
          </Link>
          <Link className="button secondary" href="/ayuda">
            Ver ayuda
          </Link>
        </nav>
      </section>
    </PublicShell>
  );
}
