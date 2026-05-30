"use client";

import { AlertsPanel } from "@/components/operations/AlertsPanel";
import { DashboardQuickActions } from "@/components/layout/DashboardQuickActions";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { PushBellButton } from "@/components/push/PushBellButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserProfileCard } from "@/components/layout/UserProfileCard";

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
  showQuickActions?: boolean;
}

export function TopBar({
  title,
  onMenuClick,
  showQuickActions = false,
}: TopBarProps) {
  return (
    <header className="flex min-h-14 flex-col gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6 md:py-0 dark:border-white/10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-ink-muted hover:bg-surface-muted lg:hidden"
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
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
        {showQuickActions ? (
          <DashboardQuickActions className="hidden sm:flex" />
        ) : null}
        <ThemeToggle />
        <PushBellButton />
        <AlertsPanel />
        <UserProfileCard />
        <LogoutButton />
      </div>
      {showQuickActions ? (
        <DashboardQuickActions className="flex w-full sm:hidden" />
      ) : null}
    </header>
  );
}
