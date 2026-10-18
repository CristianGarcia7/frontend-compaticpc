import { EQUIPMENT_WHERE } from "../lib/categories";
import type { Equipment } from "../lib/types";
import { FieldHelp } from "./field-help";
import { Field } from "./ui";

/** Shared fields for registering and editing equipment. */
export function EquipmentFields({ initial }: { initial?: Equipment }) {
  return (
    <>
      <div className="form-grid">
        <Field label="Marca">
          <input
            name="brand"
            defaultValue={initial?.brand}
            placeholder="Ej. Lenovo"
            maxLength={60}
            required
          />
        </Field>
        <Field label="Modelo exacto">
          <input
            name="model"
            defaultValue={initial?.model}
            placeholder="Ej. ThinkPad T480 (20L5)"
            maxLength={120}
            required
          />
        </Field>
        <Field label="Placa base / especificaciones conocidas">
          <input
            name="board"
            defaultValue={initial?.board}
            placeholder="Ej. DDR5, 2 ranuras SO-DIMM, máx. 64 GB"
            maxLength={240}
            required
          />
        </Field>
        <Field label="Número de serie (opcional, no se envía a la IA)">
          <input
            name="serial"
            defaultValue={initial?.serial}
            maxLength={100}
            placeholder="Ej. PF1A2B3C (etiqueta inferior)"
          />
        </Field>
      </div>
      <FieldHelp items={EQUIPMENT_WHERE} />
    </>
  );
}
