"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type DetayTab = "bilgiler" | "timeline" | "evraklar";

const tabs: { id: DetayTab; label: string }[] = [
  { id: "bilgiler", label: "Bilgiler" },
  { id: "timeline", label: "Hareket Geçmişi" },
  { id: "evraklar", label: "Evraklar" },
];

interface DosyaDetayTabsProps {
  evrakCount?: number;
  bilgiler: React.ReactNode;
  timeline: React.ReactNode;
  evraklar: React.ReactNode;
}

export function DosyaDetayTabs({
  evrakCount = 0,
  bilgiler,
  timeline,
  evraklar,
}: DosyaDetayTabsProps) {
  const [active, setActive] = useState<DetayTab>("bilgiler");

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-accent text-white"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            )}
          >
            {tab.label}
            {tab.id === "evraklar" && evrakCount > 0 && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  active === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-surface-muted text-ink-muted"
                )}
              >
                {evrakCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === "bilgiler" && bilgiler}
        {active === "timeline" && timeline}
        {active === "evraklar" && evraklar}
      </div>
    </div>
  );
}
