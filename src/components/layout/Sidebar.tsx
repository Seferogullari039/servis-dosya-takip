"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/components/layout/AuthProvider";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/dosyalar", label: "Dosyalar", icon: "☰" },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <aside
      className="flex h-full flex-col text-white"
      style={
        {
          backgroundColor: BRAND.sidebarBg,
          ["--sidebar-bg" as string]: BRAND.sidebarBg,
        } as React.CSSProperties
      }
    >
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-white/60">
          {BRAND.companyName}
        </p>
        <h1 className="mt-1 text-lg font-bold">{BRAND.panelSubtitle}</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Ana menü">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 [--tw-ring-offset-color:var(--sidebar-bg)]",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-white/50">
        {profile.full_name} · {profile.role}
      </div>
    </aside>
  );
}
