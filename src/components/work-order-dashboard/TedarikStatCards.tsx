import Link from "next/link";
import type { TedarikDashboardStats } from "@/types/work-order-dashboard";
import { cn } from "@/lib/utils/cn";

const cards: {
  key: keyof TedarikDashboardStats;
  label: string;
  href: string;
  accent: string;
}[] = [
  {
    key: "bekleyen",
    label: "Bekleyen Tedarikler",
    href: "/tedarik",
    accent: "border-l-amber-400",
  },
  {
    key: "yolda",
    label: "Yolda Olan Parçalar",
    href: "/tedarik",
    accent: "border-l-blue-500",
  },
  {
    key: "gelen",
    label: "Gelen Parçalar",
    href: "/tedarik",
    accent: "border-l-emerald-500",
  },
  {
    key: "stoktaYok",
    label: "Stokta Olmayanlar",
    href: "/tedarik",
    accent: "border-l-red-500",
  },
  {
    key: "servisSatin",
    label: "Servisin Satın Aldıkları",
    href: "/tedarik",
    accent: "border-l-violet-500",
  },
];

interface TedarikStatCardsProps {
  stats: TedarikDashboardStats;
}

export function TedarikStatCards({ stats }: TedarikStatCardsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Sigorta tedarik özeti</h2>
        <Link
          href="/tedarik"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Tedarik paneli →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ key, label, href, accent }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md border-l-4",
              accent
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-ink">
              {stats[key]}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
