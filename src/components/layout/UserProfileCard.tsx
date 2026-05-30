"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/auth/types";

function roleSubtitle(role: UserRole): string {
  return role === "admin" ? "Administrator" : "Staff Member";
}

export function UserProfileCard({ className }: { className?: string }) {
  const { profile } = useAuth();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/80 bg-surface-muted/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]",
        className
      )}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a6aad] to-[#0F4C81] text-sm text-white shadow-sm"
        aria-hidden
      >
        👤
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-ink">
          {profile.full_name}
        </p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#0F4C81] dark:text-[#5ba3d4]">
          {roleSubtitle(profile.role)}
        </p>
      </div>
    </div>
  );
}
