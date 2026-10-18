import {
  CircleCheck,
  CircleHelp,
  CircleX,
  ExternalLink,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import type { AnalysisResult, RuleStatus } from "../lib/types";

const statusMeta: Record<
  RuleStatus,
  { label: string; Icon: typeof CircleCheck }
> = {
  pass: { label: "Cumple", Icon: CircleCheck },
  fail: { label: "No cumple", Icon: CircleX },
  warn: { label: "Revisar", Icon: TriangleAlert },
  unknown: { label: "Sin datos", Icon: CircleHelp },
};

const isLink = (value: string) => /^https?:\/\//i.test(value);

/** Banner shown when Gemini failed and the API answered with rules only. */
export function FallbackBanner({ result }: { result: AnalysisResult }) {
  if (!result.fallback) return null;
  return (
    <div className="alert info" role="status">
      <ListChecks size={18} />
      <span>
        <strong>Resultado basado solo en reglas técnicas</strong> porque Gemini
        no respondió.
        {result.fallback.reason ? ` ${result.fallback.reason}` : ""}
      </span>
    </div>
  );
}

/** Contradictions between the input and the catalog or spec sheet. */
export function ResultWarnings({ result }: { result: AnalysisResult }) {
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  if (!warnings.length) return null;
  return (
    <div className="alert warning" role="alert">
      <TriangleAlert size={18} />
      <div>
        <strong>Revise estos datos antes de continuar:</strong>
        <ul className="alert-list">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Deterministic rule checks. Old analyses without rules render nothing. */
export function ResultRules({ result }: { result: AnalysisResult }) {
  const rules = Array.isArray(result.rules) ? result.rules : [];
  if (!rules.length) return null;
  return (
    <section className="result-section">
      <h3>
        <ListChecks size={19} />
        Reglas técnicas verificadas
      </h3>
      <ul className="rule-list">
        {rules.map((rule) => {
          const meta = statusMeta[rule.status] || statusMeta.unknown;
          return (
            <li key={rule.id} className={`rule ${rule.status}`}>
              <meta.Icon size={18} aria-hidden="true" />
              <div>
                <strong>
                  {rule.label}
                  <span className="rule-status">{meta.label}</span>
                </strong>
                <p>{rule.detail}</p>
                {rule.source &&
                  (isLink(rule.source) ? (
                    <a
                      href={rule.source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fuente oficial <ExternalLink size={12} />
                    </a>
                  ) : (
                    <small>Fuente: {rule.source}</small>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const providerLabel = (provider: string, model = "") =>
  provider === "demo"
    ? "Demostración local · NO GEMINI"
    : provider === "rules"
      ? "Reglas técnicas · sin IA"
      : `Gemini${model ? ` · ${model}` : ""}`;
export const providerShort = (provider: string) =>
  provider === "demo"
    ? "DEMOSTRACIÓN"
    : provider === "rules"
      ? "Reglas"
      : "Gemini";
