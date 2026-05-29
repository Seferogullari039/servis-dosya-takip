import type { AracDashboardStats } from "@/types/work-order-dashboard";
import { cn } from "@/lib/utils/cn";

const cards: {
  key: keyof AracDashboardStats;
  label: string;
  accent: string;
  format?: "money";
}[] = [
  { key: "bugunGelen", label: "Bugün Gelen Araç", accent: "border-l-violet-500" },
  { key: "islemde", label: "İşlemdeki Araçlar", accent: "border-l-blue-500" },
  { key: "parcaBekleyen", label: "Parça Bekleyenler", accent: "border-l-amber-500" },
  { key: "hazir", label: "Hazır Araçlar", accent: "border-l-emerald-500" },
  { key: "teslimEdilen", label: "Teslim Edilenler", accent: "border-l-zinc-600" },
  {
    key: "toplamAktif",
    label: "Toplam Aktif İş Emri",
    accent: "border-l-[#0c1a2e]",
  },
];

interface AracStatCardsProps {
  stats: AracDashboardStats;
}

export function AracStatCards({ stats }: AracStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ key, label, accent }) => (
        <div
          key={key}
          className={cn(
            "rounded-xl border border-border bg-surface p-4 shadow-sm border-l-4",
            accent
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-ink">
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
