"use client";

import { memo, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CollapsibleSectionProps {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={cn("rounded-xl border border-border bg-surface", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          {summary && (
            <p className="mt-0.5 text-xs text-ink-muted">{summary}</p>
          )}
        </div>
        <span className="text-ink-muted" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div id={panelId} className="border-t border-border px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
});
