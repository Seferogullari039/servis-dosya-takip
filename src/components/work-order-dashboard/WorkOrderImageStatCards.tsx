import Link from "next/link";
import type { WorkOrderImageStats } from "@/types/work-order-image";
import { cn } from "@/lib/utils/cn";

const cards: {
  key: keyof WorkOrderImageStats;
  label: string;
  description: string;
  href: string;
  accent: string;
}[] = [
  {
    key: "toplamGorsel",
    label: "Toplam görsel",
    description: "Tüm iş emirlerindeki yüklenen fotoğraflar",
    href: "/is-emirleri",
    accent: "border-l-sky-500",
  },
  {
    key: "bugunYuklenen",
    label: "Bugün yüklenen",
    description: "Son 24 saatte eklenen görseller",
    href: "/is-emirleri",
    accent: "border-l-teal-500",
  },
  {
    key: "eksikFotografliDosya",
    label: "Eksik fotoğraflı dosyalar",
    description: "Aktif iş emirleri (görsel yok)",
    href: "/is-emirleri",
    accent: "border-l-orange-500",
  },
];

interface WorkOrderImageStatCardsProps {
  stats: WorkOrderImageStats;
}

export function WorkOrderImageStatCards({ stats }: WorkOrderImageStatCardsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Hasar görsel özeti</h2>
        <Link
          href="/is-emirleri"
          className="text-xs font-semibold text-accent hover:underline"
        >
          İş emirleri →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map(({ key, label, description, href, accent }) => (
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
            <p className="mt-1 text-xs text-ink-faint">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
