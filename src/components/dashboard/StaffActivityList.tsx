import { RoleBadge } from "@/components/layout/RoleBadge";
import { EmptyState } from "@/components/ui/DataState";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTarihSaat } from "@/lib/utils/format";
import type { PersonelAktiviteOzeti } from "@/types/dashboard";

interface StaffActivityListProps {
  aktivite: PersonelAktiviteOzeti;
}

export function StaffActivityList({ aktivite }: StaffActivityListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Personel Aktivitesi</CardTitle>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-950/80 dark:text-blue-200">
          Bugün: {aktivite.bugunIslemSayisi} işlem
        </span>
      </CardHeader>

      {aktivite.kullanicilar.length === 0 ? (
        <EmptyState
          title="Aktivite yok"
          description="Seçili dönemde kayıtlı hareket bulunmuyor."
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {aktivite.kullanicilar.map((k) => (
            <li
              key={k.userId}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">{k.fullName}</span>
                <RoleBadge role={k.role} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                <span>{k.islemSayisi} işlem</span>
                {k.sonIslemZamani && (
                  <span className="text-xs text-ink-faint">
                    Son: {formatTarihSaat(k.sonIslemZamani)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
