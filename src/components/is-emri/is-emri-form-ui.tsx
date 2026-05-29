import { cn } from "@/lib/utils/cn";

export function fieldClass(screen = true) {
  return cn(
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink",
    "placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
    !screen && "min-h-[1.5rem]"
  );
}

export function labelClass() {
  return "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted print:text-[10px] print:text-gray-600";
}

export function SectionTitle({
  children,
  no,
}: {
  children: React.ReactNode;
  no: string;
}) {
  return (
    <div className="is-emri-section mb-4 flex items-center gap-3 border-b-2 border-[#0c1a2e] pb-2 print:border-gray-800">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0c1a2e] text-xs font-bold text-white print:h-6 print:w-6">
        {no}
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0c1a2e] print:text-xs print:text-gray-900">
        {children}
      </h2>
    </div>
  );
}

export function inputPropsForMode(editable: boolean, readOnly: boolean) {
  return editable && !readOnly
    ? {}
    : { readOnly: true, "aria-readonly": true as const };
}
