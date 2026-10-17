import type { Metadata } from "next";
import { PublicShell } from "../../components/public-shell";

export const metadata: Metadata = {
  title: "Política de privacidad · CompatiPC",
  description:
    "Cómo CompatiPC trata sus datos personales conforme a la Ley 1581 de 2012.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="legal">
        <span className="eyebrow">LEGAL</span>
        <h1>Política de privacidad</h1>
        <p className="legal-updated">Última actualización: octubre de 2026.</p>
        <p>
          Esta política explica cómo CompatiPC trata sus datos personales, de
          acuerdo con la Ley 1581 de 2012 de protección de datos personales
          (habeas data) y el Decreto 1377 de 2013 de Colombia.
        </p>
        <h2>1. Datos que recopilamos</h2>
        <ul>
          <li>
            Nombre, correo electrónico y contraseña protegida de su cuenta.
          </li>
          <li>
            Los equipos y consultas que registra (marca, modelo, placa,
            componentes y resultados).
          </li>
          <li>Su opinión sobre los resultados, si decide darla.</li>
        </ul>
        <h2>2. Finalidad</h2>
        <p>
          Usamos sus datos para prestarle el servicio, guardar su historial,
          mejorar la calidad de los resultados y contactarle sobre su cuenta. No
          vendemos sus datos.
        </p>
        <h2>3. Proveedores</h2>
        <p>
          Para el análisis con inteligencia artificial enviamos a Google
          (Gemini) la marca, el modelo, la placa y los datos del componente,
          nunca su número de serie ni sus datos de contacto.
        </p>
        <h2>4. Sus derechos</h2>
        <p>
          Como titular, usted puede conocer, actualizar, rectificar y solicitar
          la supresión de sus datos, revocar la autorización y presentar quejas
          ante la Superintendencia de Industria y Comercio.
        </p>
        <h2>5. Cómo ejercerlos</h2>
        <p>
          Escriba a soporte@compatipc.co desde el correo de su cuenta.
          Responderemos consultas en un máximo de 10 días hábiles y reclamos en
          un máximo de 15 días hábiles, según la ley.
        </p>
        <h2>6. Seguridad</h2>
        <p>
          Las contraseñas nunca se guardan en texto plano y el acceso a su
          información requiere iniciar sesión. Le recomendamos no registrar
          datos personales de sus clientes.
        </p>
      </article>
    </PublicShell>
  );
}
