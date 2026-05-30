"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const actions = [
  { href: "/dosyalar/yeni", label: "Yeni Dosya" },
  { href: "/is-emri", label: "Yeni İş Emri" },
  { href: "/tedarik", label: "Yeni Tedarik" },
] as const;

export function DashboardQuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex h-9 items-center rounded-lg bg-[#0F4C81] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0d4069] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
