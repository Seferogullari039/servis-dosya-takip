import Link from "next/link";
import { DurumBadge } from "@/components/dosyalar/DurumBadge";
import { EmptyState } from "@/components/ui/DataState";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { GecikenDosya } from "@/types/dashboard";

interface DelayedFilesTableProps {
  dosyalar: GecikenDosya[];
}

const seviyeStyle = {
  risk:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800",
  kritik:
    "bg-red-100 text-red-900 border-red-300 font-semibold dark:bg-red-950 dark:text-red-200 dark:border-red-700",
  normal: "",
};

export function DelayedFilesTable({ dosyalar }: DelayedFilesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Geciken Dosyalar</CardTitle>
        <p className="text-sm text-ink-muted">
          7+ gün risk · 14+ gün kritik (aynı durumda)
        </p>
      </CardHeader>

      {dosyalar.length === 0 ? (
        <EmptyState
          title="Geciken dosya yok"
          description="Tüm aktif dosyalar kabul edilebilir süre içinde."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-ink-muted">
                  <th className="pb-3 pr-4 font-medium">Dosya No</th>
                  <th className="pb-3 pr-4 font-medium">Plaka</th>
                  <th className="pb-3 pr-4 font-medium">Durum</th>
                  <th className="pb-3 pr-4 font-medium">Süre</th>
                  <th className="pb-3 font-medium">Seviye</th>
                </tr>
              </thead>
              <tbody>
                {dosyalar.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dosyalar/${d.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {d.dosyaNo}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{d.plaka}</td>
                    <td className="py-3 pr-4">
                      <DurumBadge durum={d.mevcutDurum} />
                    </td>
                    <td className="py-3 pr-4">{d.gunSayisi} gün</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-xs capitalize",
                          seviyeStyle[d.seviye]
                        )}
                      >
                        {d.seviye === "kritik" ? "Kritik" : "Risk"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {dosyalar.map((d) => (
              <Link
                key={d.id}
                href={`/dosyalar/${d.id}`}
                className={cn(
                  "rounded-lg border p-3",
                  d.seviye === "kritik"
                    ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/60"
                    : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{d.dosyaNo}</p>
                    <p className="text-sm text-ink-muted">{d.plaka}</p>
                  </div>
                  <span className="text-xs font-medium text-red-800 dark:text-red-300">
                    {d.gunSayisi} gün
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <DurumBadge durum={d.mevcutDurum} />
                  <span className="text-xs text-red-700">
                    {d.seviye === "kritik" ? "Kritik" : "Risk"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
