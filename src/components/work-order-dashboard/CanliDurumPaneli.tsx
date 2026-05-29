import Link from "next/link";
import type { CanliIsEmriSatir } from "@/types/work-order-dashboard";
import { CanliDurumSatirClient } from "@/components/work-order-dashboard/CanliDurumSatirClient";

interface CanliDurumPaneliProps {
  satirlar: CanliIsEmriSatir[];
}

export function CanliDurumPaneli({ satirlar }: CanliDurumPaneliProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Canlı Durum Paneli</h2>
        <Link
          href="/is-emirleri"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Tümünü gör →
        </Link>
      </div>

      {satirlar.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-muted">
          Aktif iş emri bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {satirlar.map((row) => (
            <CanliDurumSatirClient key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
