"use client";

import { VehicleStatusBadge } from "@/components/is-emri/VehicleStatusBadge";
import { ARAC_DURUMLARI, type AracDurumu } from "@/types/vehicle-status";
import { cn } from "@/lib/utils/cn";

interface VehicleStatusSelectProps {
  value: AracDurumu;
  onChange: (value: AracDurumu) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export function VehicleStatusSelect({
  value,
  onChange,
  disabled = false,
  compact = false,
  className,
}: VehicleStatusSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {!compact ? (
        <VehicleStatusBadge durum={value} />
      ) : null}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AracDurumu)}
        className={cn(
          "w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-ink",
          "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          compact && "text-base sm:text-sm"
        )}
        aria-label="Araç durumu"
      >
        {ARAC_DURUMLARI.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
