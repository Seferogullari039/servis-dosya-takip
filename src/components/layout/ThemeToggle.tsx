"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  /** Login gibi koyu arka planlarda küçük cam stil */
  compact?: boolean;
}

export function ThemeToggle({
  className,
  showLabel = false,
  compact = false,
}: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7ab5] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        compact
          ? "h-8 w-8 gap-0 border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
          : "h-9 gap-2 border-border bg-surface-muted px-2.5 text-ink-muted hover:bg-surface hover:text-ink focus-visible:ring-accent focus-visible:ring-offset-surface-muted",
        className
      )}
      aria-label={isDark ? "Açık moda geç" : "Gece moduna geç"}
      title={isDark ? "Açık mod" : "Gece modu"}
    >
      <span
        className={cn("leading-none", compact ? "text-sm" : "text-base")}
        aria-hidden
      >
        {isDark ? "☀️" : "🌙"}
      </span>
      {showLabel && !compact && (
        <span className="hidden sm:inline">{isDark ? "Açık" : "Gece"}</span>
      )}
    </button>
  );
}
