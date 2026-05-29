"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  DASHBOARD_PERIODS,
  type DashboardPeriod,
} from "@/types/dashboard";

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as DashboardPeriod) || "7";

  function setPeriod(period: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DASHBOARD_PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => setPeriod(p.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            current === p.value
              ? "bg-accent text-white"
              : "border border-border bg-surface text-ink-muted hover:bg-surface-muted"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
