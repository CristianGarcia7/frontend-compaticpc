import { CircleHelp } from "lucide-react";

/** Native, keyboard-accessible disclosure explaining where to find a value. */
export function FieldHelp({
  items,
  title = "¿Dónde encuentro esto?",
}: {
  items: readonly string[];
  title?: string;
}) {
  return (
    <details className="field-help">
      <summary>
        <CircleHelp size={14} aria-hidden="true" />
        {title}
      </summary>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}
