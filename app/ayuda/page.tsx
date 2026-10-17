import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "../../components/public-shell";

export const metadata: Metadata = {
  title: "Ayuda y preguntas frecuentes · CompatiPC",
  description:
    "Respuestas prácticas para registrar equipos, hacer consultas de compatibilidad y entender los resultados de CompatiPC.",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Cómo hago mi primera consulta?",
    a: (
      <ol>
        <li>
          Vaya a <Link href="/equipment">Mis equipos</Link> y registre la marca,
          el modelo exacto y la placa base.
        </li>
        <li>
          Abra <Link href="/consultation">Nueva consulta</Link>, elija el
          equipo, la categoría del componente y escriba su referencia exacta.
        </li>
        <li>
          Revise el resultado, descargue el informe PDF y díganos si le fue
          útil.
        </li>
      </ol>
    ),
  },
  {
    q: "¿Dónde encuentro el modelo y la placa base de un equipo?",
    a: (
      <p>
        En la etiqueta inferior o trasera del equipo. En Windows, ejecute
        «msinfo32» (modelo del sistema y placa base) o use CPU-Z / HWiNFO, que
        también muestran el tipo de memoria y las ranuras libres. El manual del
        fabricante o el BIOS indican el máximo de memoria admitido.
      </p>
    ),
  },
  {
    q: "¿Cómo sé qué memoria RAM tiene instalada?",
    a: (
      <p>
        Lea la etiqueta adhesiva del módulo, ejecute «wmic memorychip get
        partnumber,speed,capacity» en la consola de Windows o abra la pestaña
        SPD de CPU-Z. Tenga en cuenta el formato: los portátiles usan SO-DIMM y
        los equipos de escritorio usan DIMM.
      </p>
    ),
  },
  {
    q: "¿Qué datos necesito para una batería o un cargador?",
    a: (
      <p>
        Para baterías: voltaje, Wh, número de celdas y número de parte (están en
        la etiqueta de la batería original). Para cargadores: potencia (W),
        voltaje y amperaje de salida, y el tipo de conector (USB-C PD, punta
        redonda o propietario). Compárelos con la etiqueta inferior del equipo.
      </p>
    ),
  },
  {
    q: "¿Qué significan «Compatible», «Por verificar» e «Incompatible»?",
    a: (
      <p>
        «Compatible» indica que los datos aportados coinciden con los requisitos
        del equipo. «Por verificar» indica que faltan datos o hay riesgos que
        debe confirmar. «Incompatible» indica que al menos una regla técnica
        falla (por ejemplo, DDR4 en una placa DDR5). Ningún resultado reemplaza
        la ficha técnica oficial del fabricante.
      </p>
    ),
  },
  {
    q: "¿Qué son las reglas técnicas del resultado?",
    a: (
      <p>
        Son comprobaciones automáticas y verificables (generación de memoria,
        formato DIMM o SO-DIMM, socket, potencia de la fuente o del cargador).
        Cada una muestra si cumple, no cumple o necesita revisión, y cuando es
        posible enlaza la fuente oficial.
      </p>
    ),
  },
  {
    q: "El resultado dice «basado solo en reglas técnicas». ¿Qué pasó?",
    a: (
      <p>
        Gemini no respondió a tiempo o no estaba disponible. En lugar de dejarle
        sin respuesta, CompatiPC entrega el resultado de las reglas técnicas.
        Puede repetir la consulta más tarde para obtener también el análisis de
        la IA.
      </p>
    ),
  },
  {
    q: "Aparece «Su sesión expiró». ¿Perdí mis datos?",
    a: (
      <p>
        No. Sus equipos y consultas siguen guardados. Vuelva a{" "}
        <Link href="/login?mode=login">iniciar sesión</Link> y continúe donde
        estaba.
      </p>
    ),
  },
  {
    q: "Aparece «No pudimos conectar con CompatiPC» o «demasiadas solicitudes».",
    a: (
      <p>
        Revise su conexión a internet y espere unos segundos antes de
        reintentar. Si hizo muchas consultas seguidas, espere un minuto: el
        límite protege el servicio para todos los usuarios.
      </p>
    ),
  },
  {
    q: "¿Mis datos se envían a la IA?",
    a: (
      <p>
        Solo la marca, el modelo, la placa y los datos del componente. El número
        de serie nunca se envía. No escriba datos personales de sus clientes en
        las especificaciones.
      </p>
    ),
  },
  {
    q: "Olvidé mi contraseña.",
    a: (
      <p>
        Por ahora el restablecimiento se hace con soporte: escriba desde el
        correo de su cuenta a soporte@compatipc.co y le ayudaremos a recuperar
        el acceso.
      </p>
    ),
  },
];

export default function HelpPage() {
  return (
    <PublicShell>
      <section className="public-hero compact">
        <span className="eyebrow">AYUDA</span>
        <h1>Preguntas frecuentes</h1>
        <p>
          Respuestas prácticas para trabajar con CompatiPC sin depender de
          nadie.
        </p>
      </section>
      <section className="faq">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <div className="faq-answer">{item.a}</div>
          </details>
        ))}
      </section>
      <p className="faq-contact">
        ¿No encontró su respuesta? Escriba a soporte@compatipc.co.
      </p>
    </PublicShell>
  );
}
