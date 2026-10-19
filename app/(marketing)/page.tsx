import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Cpu,
  FileDown,
  ListChecks,
  Monitor,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "../../components/public-shell";

export const metadata: Metadata = {
  title: "CompatiPC · Compatibilidad de componentes con criterio",
  description:
    "Compruebe si una memoria, un disco, una batería o un cargador es compatible con el equipo de su cliente antes de comprar. Reglas técnicas verificables, análisis con IA e informe PDF.",
};

const steps = [
  {
    icon: Monitor,
    title: "Registre el equipo",
    text: "Marca, modelo exacto y placa base. Le indicamos dónde encontrar cada dato.",
  },
  {
    icon: Search,
    title: "Describa el componente",
    text: "Referencia y especificaciones de la RAM, el disco, la batería o el cargador.",
  },
  {
    icon: FileDown,
    title: "Decida con respaldo",
    text: "Veredicto, reglas técnicas, riesgos y un informe PDF para su cliente.",
  },
];

const benefits = [
  {
    icon: ListChecks,
    title: "Reglas técnicas verificables",
    text: "Generación de memoria, DIMM o SO-DIMM, socket, potencia de fuente y cargador.",
  },
  {
    icon: BadgeCheck,
    title: "Contrastado con el fabricante",
    text: "Enlaces a la ficha técnica oficial y advertencias cuando los datos no coinciden.",
  },
  {
    icon: ClipboardList,
    title: "Historial documentado",
    text: "Cada consulta queda guardada para revisar, buscar y compartir.",
  },
  {
    icon: ShieldCheck,
    title: "Siempre hay respuesta",
    text: "Si la IA no responde, el resultado se basa en las reglas técnicas.",
  },
];

export default function LandingPage() {
  return (
    <PublicShell>
      <section className="landing-hero">
        <div>
          <span className="eyebrow">
            PARA TÉCNICOS Y TALLERES DE COMPUTADORES
          </span>
          <h1>
            Compruebe la compatibilidad <em>antes de comprar</em> el repuesto.
          </h1>
          <p>
            CompatiPC cruza los datos del equipo con el componente que necesita
            y le entrega un veredicto claro, las reglas técnicas que lo
            respaldan y un informe para su cliente.
          </p>
          <div className="landing-cta">
            <Link className="button" href="/login?mode=register">
              Crear cuenta gratis <ArrowRight size={18} />
            </Link>
            <span>14 días gratis · Sin tarjeta</span>
          </div>
        </div>
        <div className="landing-visual" aria-hidden="true">
          <Cpu size={84} />
          <span className="landing-chip pass">DDR5 · SO-DIMM ✓</span>
          <span className="landing-chip fail">Cargador 45 W ✗</span>
        </div>
      </section>

      <section className="landing-section">
        <h2>Menos devoluciones, más confianza</h2>
        <p className="landing-lead">
          Un repuesto equivocado cuesta tiempo, dinero y la confianza del
          cliente. CompatiPC le ayuda a confirmar cada compra con datos.
        </p>
      </section>

      <section className="landing-section" id="como-funciona">
        <h2>Cómo funciona</h2>
        <ol className="landing-steps">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span className="landing-step-number">0{i + 1}</span>
              <step.icon size={22} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section">
        <h2>Lo que obtiene</h2>
        <div className="landing-benefits">
          {benefits.map((b) => (
            <article key={b.title}>
              <b.icon size={22} />
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final">
        <h2>Haga su primera consulta hoy.</h2>
        <p>
          Sin instalación. Vea los <Link href="/precios">planes y precios</Link>{" "}
          cuando lo necesite.
        </p>
        <Link className="button" href="/login?mode=register">
          Crear cuenta gratis <ArrowRight size={18} />
        </Link>
      </section>
    </PublicShell>
  );
}
