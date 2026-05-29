"use client";

import { VEHICLE_STATUS_STYLES } from "@/lib/vehicle-status/styles";
import type { AracDurumu } from "@/types/vehicle-status";
import { cn } from "@/lib/utils/cn";

interface VehicleStatusBadgeProps {
  durum: AracDurumu;
  size?: "sm" | "md";
  className?: string;
}

export function VehicleStatusBadge({
  durum,
  size = "md",
  className,
}: VehicleStatusBadgeProps) {
  const styles = VEHICLE_STATUS_STYLES[durum];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        styles.badge,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          styles.dot,
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        aria-hidden
      />
      {durum}
    </span>
  );
}
