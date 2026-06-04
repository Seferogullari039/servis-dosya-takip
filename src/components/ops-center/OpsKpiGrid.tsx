import { cn } from "@/lib/utils/cn";
import type { OpsCenterKpis } from "@/types/ops-center-dashboard";

const KPI_ITEMS: {
  key: keyof OpsCenterKpis;
  label: string;
  accent: string;
}[] = [
  { key: "acikIsEmirleri", label: "Açık İş Emirleri", accent: "from-[#0F4C81]/20" },
  { key: "parcaBekleyen", label: "Parça Bekleyen", accent: "from-amber-500/15" },
  { key: "hazirTeslim", label: "Hazır Teslim", accent: "from-emerald-500/15" },
  {
    key: "bugunTeslimEdilecek",
    label: "Bugün Teslim Edilecek",
    accent: "from-sky-500/15",
  },
  { key: "aktifDosya", label: "Aktif Dosya", accent: "from-[#0F4C81]/12" },
  {
    key: "tahsilatBekleyen",
    label: "Tahsilat Bekleyen",
    accent: "from-orange-500/15",
  },
  {
    key: "pertIncelemesinde",
    label: "Pert İncelemesinde",
    accent: "from-orange-600/20",
  },
  {
    key: "pertOnaylandi",
    label: "Pert Onaylandı",
    accent: "from-red-500/15",
  },
];

interface OpsKpiGridProps {
  kpis: OpsCenterKpis;
}

export function OpsKpiGrid({ kpis }: OpsKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
      {KPI_ITEMS.map((item) => (
        <div
          key={item.key}
          className={cn(
            "rounded-2xl border border-border/80 bg-gradient-to-br to-surface/80 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:to-transparent",
            item.accent
          )}
        >
          <p className="text-xs font-medium text-ink-muted">{item.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {kpis[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
