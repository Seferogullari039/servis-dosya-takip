import { cn } from "@/lib/utils/cn";

export function fieldClass(screen = true) {
  return cn(
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink",
    "placeholder:text-ink-faint dark:placeholder:text-zinc-500",
    "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
    "dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-100",
    !screen && "min-h-[1.5rem]"
  );
}

export function labelClass() {
  return cn(
    "mb-1 block text-xs font-semibold uppercase tracking-wide",
    "text-ink-muted dark:text-zinc-300",
    "print:text-[10px] print:text-gray-600"
  );
}

/** Tablo başlık satırı (parça, işçilik, ekspertiz) */
export function tableHeadClass() {
  return cn(
    "bg-surface-muted text-xs uppercase text-ink-muted",
    "dark:bg-zinc-800/70 dark:text-zinc-300",
    "print:bg-gray-100 print:text-gray-600"
  );
}

export function mutedHintClass() {
  return "text-xs text-ink-muted dark:text-zinc-400";
}

export function SectionTitle({
  children,
  no,
}: {
  children: React.ReactNode;
  no: string;
}) {
  return (
    <div
      className={cn(
        "is-emri-section mb-4 flex items-center gap-3 border-b-2 pb-2",
        "border-[#0c1a2e] dark:border-zinc-500",
        "print:border-gray-800"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white",
          "bg-[#0c1a2e] dark:bg-zinc-600",
          "print:h-6 print:w-6"
        )}
      >
        {no}
      </span>
      <h2
        className={cn(
          "text-sm font-bold uppercase tracking-wide",
          "text-[#0c1a2e] dark:text-zinc-100",
          "print:text-xs print:text-gray-900"
        )}
      >
        {children}
      </h2>
    </div>
  );
}

export function IsEmriNoBadge({ workOrderNo }: { workOrderNo: string }) {
  return (
    <div className="shrink-0 text-right">
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          "text-ink-muted dark:text-zinc-400"
        )}
      >
        İş Emri No
      </p>
      <p
        className={cn(
          "mt-1 inline-block rounded-lg border px-3 py-1.5",
          "border-border bg-surface-muted/90 font-mono text-sm font-bold tabular-nums tracking-wide",
          "text-ink shadow-sm",
          "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:shadow-none"
        )}
      >
        {workOrderNo}
      </p>
    </div>
  );
}

export function inputPropsForMode(editable: boolean, readOnly: boolean) {
  return editable && !readOnly
    ? {}
    : { readOnly: true, "aria-readonly": true as const };
}
