"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty">
      <h1>No se pudo cargar este espacio.</h1>
      <p>Intente nuevamente. Sus datos guardados no se han eliminado.</p>
      <button className="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
