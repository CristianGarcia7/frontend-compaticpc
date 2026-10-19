import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "../../../components/public-shell";

export const metadata: Metadata = {
  title: "Términos de uso · CompatiPC",
  description: "Condiciones de uso del servicio CompatiPC.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="legal">
        <span className="eyebrow">LEGAL</span>
        <h1>Términos de uso</h1>
        <p className="legal-updated">Última actualización: octubre de 2026.</p>
        <h2>1. El servicio</h2>
        <p>
          CompatiPC es una herramienta de orientación técnica que ayuda a
          evaluar la compatibilidad entre equipos de cómputo y componentes. Sus
          resultados combinan reglas técnicas y análisis con inteligencia
          artificial.
        </p>
        <h2>2. Resultados orientativos</h2>
        <p>
          Los resultados no son una certificación del fabricante. Antes de
          comprar, modificar o instalar un componente, usted debe confirmar las
          especificaciones en la documentación oficial. CompatiPC no responde
          por daños derivados de decisiones tomadas sin esa verificación.
        </p>
        <h2>3. Su cuenta</h2>
        <p>
          Usted es responsable de mantener la confidencialidad de su contraseña
          y de la información que registra. No ingrese datos personales de sus
          clientes en los campos de especificaciones.
        </p>
        <h2>4. Uso aceptable</h2>
        <p>
          No use el servicio para fines ilícitos, para intentar acceder a
          cuentas ajenas ni para sobrecargar la plataforma de forma
          automatizada.
        </p>
        <h2>5. Planes y pagos</h2>
        <p>
          Los precios publicados son de referencia. Las condiciones comerciales
          definitivas se informarán antes de cualquier cobro.
        </p>
        <h2>6. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. El
          tratamiento de datos personales se describe en la{" "}
          <Link href="/privacidad">política de privacidad</Link>.
        </p>
        <h2>7. Contacto</h2>
        <p>Escríbanos a soporte@compatipc.co.</p>
      </article>
    </PublicShell>
  );
}
