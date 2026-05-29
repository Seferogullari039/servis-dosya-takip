import { fieldLabel } from "@/lib/events/messages";

interface EventChangeDetailsProps {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function EventChangeDetails({
  oldValue,
  newValue,
}: EventChangeDetailsProps) {
  const keys = new Set([
    ...Object.keys(oldValue ?? {}),
    ...Object.keys(newValue ?? {}),
  ]);

  if (keys.size === 0) return null;

  return (
    <div className="mt-2 space-y-1 rounded-lg bg-surface-muted p-2 text-xs">
      {Array.from(keys).map((key) => (
        <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <span className="shrink-0 font-medium text-ink-muted">
            {fieldLabel(key)}:
          </span>
          <span className="text-ink">
            {oldValue?.[key] !== undefined && (
              <span className="text-ink-faint line-through">
                {formatValue(oldValue[key])}
              </span>
            )}
            {oldValue?.[key] !== undefined && newValue?.[key] !== undefined && (
              <span className="mx-1 text-ink-faint">→</span>
            )}
            {newValue?.[key] !== undefined && (
              <span>{formatValue(newValue[key])}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
