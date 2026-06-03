import { Card } from "@/components/ui/Card";
import type { FinansMetrikleri } from "@/types/dashboard";
import { formatTarihSaat } from "@/lib/utils/format";
import { formatPara } from "@/lib/utils/para";
import Link from "next/link";

interface FinanceCardProps {
  finans: FinansMetrikleri;
}

export function FinanceCard({ finans }: FinanceCardProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-ink">Finans Özeti</h2>

      <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4 dark:border-accent/40 dark:bg-accent/10">
        <p className="text-sm font-medium text-accent dark:text-blue-300">
          Tahsil edilen
        </p>
        <p className="mt-1 text-3xl font-bold text-ink">
          {formatPara(finans.toplamTahsilat)}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Gerçekleşen tahsilatların toplamı
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
          <p className="text-sm text-ink-muted">Kapanan dosya tutarı</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-ink">
            {formatPara(finans.kapananDosyaTutari)}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Tahsilat bekleyen
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
            {formatPara(finans.tahsilatBekleyen)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted/40 p-4 sm:col-span-2">
          <p className="text-sm text-ink-muted">Aktif dosya tahmini tutarı</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-ink">
            {formatPara(finans.aktifDosyaTahminiTutari)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Kapanmamış dosyaların tanımlı tutar toplamı
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Ödeme Bekleyen
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {finans.odemeBekleyen}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Kısmi Ödenen
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">
            {finans.kismiOdenen}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/60">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Tamamlanan Ödeme
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {finans.tamamlananOdeme}
          </p>
        </div>
      </div>

      {finans.sonOdemeHareketleri.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-ink-muted">
            Son Ödeme Hareketleri
          </p>
          <ul className="space-y-2">
            {finans.sonOdemeHareketleri.slice(0, 5).map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-1 rounded-lg border border-border/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dosyalar/${h.serviceFileId}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {h.dosyaNo} · {h.plaka}
                  </Link>
                  <p className="truncate text-xs text-ink-muted">{h.title}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-faint">
                  {formatTarihSaat(h.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
