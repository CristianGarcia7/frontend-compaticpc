import { Cpu } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import type { Analysis } from "../lib/types";
const verdicts = {
  compatible: "Compatible",
  conditional: "Por verificar",
  incompatible: "Incompatible",
};
export function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`button ${props.className || ""}`}>
      {children}
    </button>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Badge({ value }: { value: Analysis["result"]["verdict"] }) {
  return (
    <span className={`badge ${value}`}>
      <span />
      {verdicts[value]}
    </span>
  );
}
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Cpu size={22} />
      </span>
      <span>
        Compati<span className="brand-pc">PC</span>
        <small>DECISIONES QUE ENCAJAN</small>
      </span>
    </div>
  );
}
