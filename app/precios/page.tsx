import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "../../components/public-shell";

export const metadata: Metadata = {
  title: "Precios · CompatiPC",
  description:
    "Planes de CompatiPC para técnicos independientes y talleres. 14 días gratis sin tarjeta.",
};

const plans = [
  {
    name: "Básico",
    price: "$29.900",
    audience: "Técnico independiente que empieza.",
    features: [
      "30 consultas al mes",
      "Hasta 20 equipos registrados",
      "Reglas técnicas y análisis con IA",
      "Informe PDF por consulta",
    ],
  },
  {
    name: "Profesional",
    price: "$59.900",
    audience: "Técnico con flujo constante de clientes.",
    recommended: true,
    features: [
      "Consultas ilimitadas",
      "Equipos ilimitados",
      "Historial con búsqueda completa",
      "Enlaces a fichas técnicas oficiales",
      "Soporte por correo prioritario",
    ],
  },
  {
    name: "Taller / Empresa",
    price: "$149.900",
    audience: "Talleres con varios técnicos.",
    features: [
      "Todo lo del plan Profesional",
      "Hasta 5 usuarios técnicos",
      "Catálogo de referencias propio",
      "Acompañamiento en la puesta en marcha",
    ],
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="public-hero compact">
        <span className="eyebrow">PRECIOS</span>
        <h1>Un plan para cada forma de trabajar</h1>
        <p>
          Pruebe cualquier plan <strong>14 días gratis, sin tarjeta</strong>.
          Cancele cuando quiera.
        </p>
      </section>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-card ${plan.recommended ? "recommended" : ""}`}
          >
            {plan.recommended && (
              <span className="pricing-badge">Recomendado</span>
            )}
            <h2>{plan.name}</h2>
            <p className="pricing-audience">{plan.audience}</p>
            <p className="pricing-price">
              {plan.price} <span>COP / mes</span>
            </p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>
                  <Check size={16} aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
            <Link
              className={`button full ${plan.recommended ? "" : "secondary"}`}
              href="/login?mode=register"
            >
              Empezar prueba gratis
            </Link>
          </article>
        ))}
      </div>
      <p className="pricing-note">
        Precios de referencia en pesos colombianos (COP), IVA no incluido. Son
        valores ilustrativos del proyecto y pueden cambiar antes del lanzamiento
        comercial.
      </p>
    </PublicShell>
  );
}
