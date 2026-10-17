"use client";
import { ArrowUpRight, Check, Monitor, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { setSession } from "../lib/session-store";
import type { Equipment } from "../lib/types";
import { EquipmentFields } from "./equipment-fields";
import { Button } from "./ui";

/** Equipment card with inline edit (PATCH) and delete. */
export function EquipmentCard({
  equipment: e,
  onConsult,
  onNotice,
  onError,
}: {
  equipment: Equipment;
  onConsult: () => void;
  onNotice: (message: string) => void;
  /** Receives "" to clear, or the raw error so 401s can end the session. */
  onError: (error: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    onError("");
    onNotice("");
    try {
      await fn();
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    run(async () => {
      const updated = await api<Partial<Equipment>>(`/equipment/${e.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      const row = { ...e, ...values, ...(updated?.id ? updated : {}) };
      setSession((s) => ({
        equipment: s.equipment.map((x) => (x.id === e.id ? row : x)),
      }));
      setEditing(false);
      onNotice("Equipo actualizado.");
    });
  }

  function remove() {
    if (
      !confirm("¿Eliminar este equipo? Los informes históricos se conservarán.")
    )
      return;
    run(async () => {
      await api(`/equipment/${e.id}`, { method: "DELETE" });
      setSession((s) => ({
        equipment: s.equipment.filter((x) => x.id !== e.id),
        stats: { ...s.stats, equipment: Math.max(0, s.stats.equipment - 1) },
      }));
    });
  }

  if (editing)
    return (
      <article className="panel equipment-card editing">
        <div className="equipment-card-top">
          <h3>Editar equipo</h3>
          <button
            className="icon-button"
            aria-label="Cancelar edición"
            onClick={() => setEditing(false)}
          >
            <X size={17} />
          </button>
        </div>
        <form onSubmit={save}>
          <EquipmentFields initial={e} />
          <div className="button-row">
            <Button disabled={busy}>
              {busy ? "Guardando…" : "Guardar cambios"} <Check size={16} />
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </article>
    );

  return (
    <article className="panel equipment-card">
      <div className="equipment-card-top">
        <span className="equipment-icon">
          <Monitor size={28} />
        </span>
        <div>
          <button
            className="icon-button"
            aria-label={`Editar ${e.model}`}
            disabled={busy}
            onClick={() => setEditing(true)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button"
            aria-label={`Eliminar ${e.model}`}
            disabled={busy}
            onClick={remove}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <span className="eyebrow">{e.brand}</span>
      <h3>{e.model}</h3>
      <p>{e.board}</p>
      <div className="equipment-meta">Serie: {e.serial || "No registrada"}</div>
      <button className="text-button" onClick={onConsult}>
        Consultar compatibilidad <ArrowUpRight size={16} />
      </button>
    </article>
  );
}
