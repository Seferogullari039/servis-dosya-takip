"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-muted px-2.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted",
        className
      )}
      aria-label={isDark ? "Açık moda geç" : "Gece moduna geç"}
      title={isDark ? "Açık mod" : "Gece modu"}
    >
      <span className="text-base leading-none" aria-hidden>
        {isDark ? "☀️" : "🌙"}
      </span>
      {showLabel && (
        <span className="hidden sm:inline">{isDark ? "Açık" : "Gece"}</span>
      )}
    </button>
  );
}
