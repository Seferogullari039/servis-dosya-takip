import { TEDARIK_DOT_STYLES, TEDARIK_STATUS_STYLES } from "@/lib/tedarik/styles";
import type { TedarikDurumu } from "@/types/tedarik";
import { cn } from "@/lib/utils/cn";

interface TedarikDurumBadgeProps {
  durum: TedarikDurumu;
  size?: "sm" | "md";
  className?: string;
}

export function TedarikDurumBadge({
  durum,
  size = "md",
  className,
}: TedarikDurumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        TEDARIK_STATUS_STYLES[durum],
        size === "sm" ? "px-2 py-0.5 text-[10px] leading-tight" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          TEDARIK_DOT_STYLES[durum],
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        aria-hidden
      />
      <span className="truncate">{durum}</span>
    </span>
  );
}
