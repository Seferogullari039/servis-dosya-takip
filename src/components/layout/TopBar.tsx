"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { AlertsPanel } from "@/components/operations/AlertsPanel";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { RoleBadge } from "@/components/layout/RoleBadge";
import { PushBellButton } from "@/components/push/PushBellButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  const { profile } = useAuth();

  return (
    <header className="flex min-h-14 flex-col gap-3 border-b border-border bg-surface px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted lg:hidden"
          aria-label="Menüyü aç"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <ThemeToggle />
        <PushBellButton />
        <AlertsPanel />
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5">
          <span className="text-sm font-medium text-ink">
            {profile.full_name}
          </span>
          <RoleBadge role={profile.role} />
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
