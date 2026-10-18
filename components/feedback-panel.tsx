"use client";
import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import { rememberAnalysis } from "../lib/session-store";
import type { Analysis } from "../lib/types";

const MAX_REASON = 500;

/** Useful / not useful vote plus an optional free-text reason. */
export function FeedbackPanel({
  analysis,
  onNotice,
  onError,
}: {
  analysis: Analysis;
  onNotice: (message: string) => void;
  /** Receives "" to clear, or the raw error so 401s can end the session. */
  onError: (error: unknown) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [choice, setChoice] = useState<string | null>(analysis.feedback);
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState(false);

  async function send(feedback: string, withReason: string) {
    setBusy(true);
    onError("");
    try {
      const trimmed = withReason.trim();
      // A 2xx response without a body yields null.
      const updated = await api<Analysis | null>(
        `/analyses/${analysis.id}/feedback`,
        {
          method: "PATCH",
          // Only send `reason` when present: older APIs reject unknown fields.
          body: JSON.stringify(
            trimmed ? { feedback, reason: trimmed } : { feedback },
          ),
        },
      );
      rememberAnalysis({
        ...analysis,
        ...(updated ?? {}),
        feedback,
        feedbackReason:
          updated?.feedbackReason ?? (trimmed || analysis.feedbackReason),
      });
      setChoice(feedback);
      setEditing(!trimmed);
      setReason("");
      onNotice(
        trimmed
          ? "Gracias. Su comentario fue guardado."
          : "Gracias. Su opinión fue guardada.",
      );
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="feedback-block">
      <div className="feedback">
        <div>
          <strong>¿Le resultó útil esta orientación?</strong>
          <p>Su respuesta queda asociada a esta consulta.</p>
        </div>
        <div className="button-row">
          {(["useful", "not-useful"] as const).map((value, i) => (
            <button
              key={value}
              disabled={busy}
              aria-pressed={choice === value}
              className={`button secondary ${choice === value ? "chosen" : ""}`}
              onClick={() => send(value, "")}
            >
              {i ? <ThumbsDown size={16} /> : <ThumbsUp size={16} />}{" "}
              {i ? "No" : "Sí"}
            </button>
          ))}
        </div>
      </div>
      {analysis.feedbackReason && !editing && (
        <p className="feedback-saved">
          <strong>Su comentario:</strong> {analysis.feedbackReason}
        </p>
      )}
      {choice && editing && (
        <form
          className="feedback-reason"
          onSubmit={(e) => {
            e.preventDefault();
            if (reason.trim()) send(choice, reason);
          }}
        >
          <label htmlFor={`reason-${analysis.id}`}>
            {choice === "useful"
              ? "¿Qué le sirvió más? (opcional)"
              : "¿Qué faltó o qué estuvo mal? (opcional)"}
          </label>
          <textarea
            id={`reason-${analysis.id}`}
            rows={3}
            maxLength={MAX_REASON}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. El resultado no consideró que el equipo tiene una sola ranura libre."
          />
          <div className="feedback-reason-row">
            <span className="input-hint" aria-live="polite">
              {reason.length}/{MAX_REASON}
            </span>
            <button
              type="submit"
              className="button secondary"
              disabled={busy || !reason.trim()}
            >
              <Send size={15} /> Enviar comentario
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
