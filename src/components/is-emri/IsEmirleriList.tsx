"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  guncelleAracDurumuAction,
  silIsEmriAction,
} from "@/app/(dashboard)/is-emirleri/actions";
import { VehicleStatusBadge } from "@/components/is-emri/VehicleStatusBadge";
import { VehicleStatusSelect } from "@/components/is-emri/VehicleStatusSelect";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { formatPara } from "@/lib/utils/para";
import type { IsEmriOzet } from "@/types/is-emri";
import type { UserRole } from "@/types/supabase";
import type { AracDurumu } from "@/types/vehicle-status";
import { cn } from "@/lib/utils/cn";

function formatTarih(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

interface IsEmirleriListProps {
  kayitlar: IsEmriOzet[];
  role: UserRole;
  hasFilters?: boolean;
}

export function IsEmirleriList({
  kayitlar,
  role,
  hasFilters = false,
}: IsEmirleriListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDelete = (id: string, label: string) => {
    if (!window.confirm(`${label} iş emrini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await silIsEmriAction(id);
      setDeletingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast("İş emri silindi.", "success");
      router.refresh();
    });
  };

  const handleStatusChange = (id: string, aracDurumu: AracDurumu) => {
    setError(null);
    setUpdatingId(id);
    startTransition(async () => {
      const result = await guncelleAracDurumuAction(id, aracDurumu);
      setUpdatingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast("Araç durumu güncellendi.", "success");
      router.refresh();
    });
  };

  if (kayitlar.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          {hasFilters ? "Filtreye uygun kayıt yok" : "Henüz kayıtlı iş emri yok"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {hasFilters
            ? "Filtreleri değiştirin veya temizleyin."
            : "Yeni bir iş emri oluşturmak için aşağıdaki butonu kullanın."}
        </p>
        {!hasFilters ? (
          <Link href="/is-emri" className="mt-4 inline-block">
            <Button type="button">Yeni iş emri</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          {kayitlar.length} kayıt listeleniyor
        </p>
        <Link href="/is-emri">
          <Button type="button">+ Yeni iş emri</Button>
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Plaka</th>
              <th className="px-4 py-3 font-semibold">Müşteri</th>
              <th className="px-4 py-3 font-semibold">Durum</th>
              <th className="px-4 py-3 font-semibold">Tarih</th>
              <th className="px-4 py-3 font-semibold text-right">Toplam</th>
              <th className="px-4 py-3 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kayitlar.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/30">
                <td className="px-4 py-3 font-medium text-ink">{row.plaka}</td>
                <td className="px-4 py-3 text-ink">{row.musteriAdi}</td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[200px] flex-col gap-2">
                    <VehicleStatusBadge durum={row.aracDurumu} size="sm" />
                    <VehicleStatusSelect
                      value={row.aracDurumu}
                      onChange={(d) => handleStatusChange(row.id, d)}
                      disabled={pending && updatingId === row.id}
                      compact
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {formatTarih(row.tarih)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                  {formatPara(row.toplamTutar)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/is-emirleri/${row.id}`}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                      >
                        Görüntüle
                      </Button>
                    </Link>
                    <Link href={`/is-emirleri/${row.id}?yazdir=1`}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                      >
                        Yazdır
                      </Button>
                    </Link>
                    {role === "admin" ? (
                      <Button
                        type="button"
                        variant="danger"
                        className="h-9 px-3 text-xs"
                        disabled={pending && deletingId === row.id}
                        onClick={() =>
                          handleDelete(row.id, row.plaka || row.isEmriNo)
                        }
                      >
                        Sil
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {kayitlar.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold tracking-wide text-ink">
                  {row.plaka}
                </p>
                <p className="text-sm text-ink-muted">{row.musteriAdi}</p>
                <p className="mt-1 text-xs text-ink-faint">
                  {formatTarih(row.tarih)} · {row.isEmriNo}
                </p>
                <div className="mt-2">
                  <VehicleStatusBadge durum={row.aracDurumu} />
                </div>
              </div>
              <p className="shrink-0 text-right text-base font-bold tabular-nums text-accent">
                {formatPara(row.toplamTutar)}
              </p>
            </div>

            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-ink-muted">
                Hızlı durum değiştir
              </p>
              <VehicleStatusSelect
                value={row.aracDurumu}
                onChange={(d) => handleStatusChange(row.id, d)}
                disabled={pending && updatingId === row.id}
                compact
              />
            </div>

            <div
              className={cn(
                "mt-4 grid gap-2",
                role === "admin" ? "grid-cols-3" : "grid-cols-2"
              )}
            >
              <Link href={`/is-emirleri/${row.id}`} className="min-w-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full text-xs"
                >
                  Görüntüle
                </Button>
              </Link>
              <Link href={`/is-emirleri/${row.id}?yazdir=1`} className="min-w-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full text-xs"
                >
                  Yazdır
                </Button>
              </Link>
              {role === "admin" ? (
                <Button
                  type="button"
                  variant="danger"
                  className="h-11 w-full text-xs"
                  disabled={pending && deletingId === row.id}
                  onClick={() => handleDelete(row.id, row.plaka || row.isEmriNo)}
                >
                  Sil
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
