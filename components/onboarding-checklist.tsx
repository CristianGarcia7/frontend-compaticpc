"use client";
import { CheckCircle2, Circle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Analysis } from "../lib/types";

const STORAGE_KEY = "compatipc-onboarding-dismissed";

/** First-use checklist; progress is derived from the user's real data. */
export function OnboardingChecklist({
  equipmentCount,
  analysesCount,
  analyses,
  onNavigate,
  onRegisterEquipment,
}: {
  equipmentCount: number;
  analysesCount: number;
  analyses: Analysis[];
  onNavigate: (view: string) => void;
  /** Goes to the equipment page with the register form already open. */
  onRegisterEquipment: () => void;
}) {
  // Start hidden to avoid a flash before localStorage is read.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);
  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  const latest = analyses[0];
  const steps = [
    {
      done: equipmentCount > 0,
      label: "Registre su primer equipo",
      action: onRegisterEquipment,
    },
    {
      done: analysesCount > 0,
      label: "Haga su primera consulta",
      action: () =>
        equipmentCount ? onNavigate("query") : onRegisterEquipment(),
    },
    {
      done: analysesCount > 0,
      label: "Revise el resultado y descargue el informe PDF",
      href: latest ? `/analyses/${latest.id}` : undefined,
      action: () => onNavigate("history"),
    },
    {
      done: analyses.some((a) => a.feedback),
      label: "Díganos si el resultado le fue útil",
      href: latest ? `/analyses/${latest.id}` : undefined,
      action: () => onNavigate("history"),
    },
  ];
  const completed = steps.filter((s) => s.done).length;
  if (dismissed || completed === steps.length) return null;

  return (
    <section className="panel onboarding" aria-labelledby="onboarding-title">
      <div className="panel-heading">
        <div>
          <h3 id="onboarding-title">Primeros pasos en CompatiPC</h3>
          <p>
            {completed} de {steps.length} completados. Siga estos pasos para
            obtener su primer diagnóstico documentado.
          </p>
        </div>
        <button
          className="icon-button"
          aria-label="Ocultar primeros pasos"
          onClick={dismiss}
        >
          <X size={18} />
        </button>
      </div>
      <div
        className="onboarding-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={completed}
        aria-label="Progreso de primeros pasos"
      >
        <span style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      <ol className="onboarding-steps">
        {steps.map((step) => (
          <li key={step.label} className={step.done ? "done" : ""}>
            {step.done ? (
              <CheckCircle2 size={18} aria-label="Completado" />
            ) : (
              <Circle size={18} aria-label="Pendiente" />
            )}
            {step.done ? (
              <span>{step.label}</span>
            ) : step.href ? (
              <Link href={step.href}>{step.label}</Link>
            ) : (
              <button className="text-button" onClick={step.action}>
                {step.label}
              </button>
            )}
          </li>
        ))}
      </ol>
      <p className="onboarding-help">
        ¿Tiene dudas? Consulte la{" "}
        <Link href="/ayuda">ayuda y preguntas frecuentes</Link>.
      </p>
    </section>
  );
}
