"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { DosyaAramaUrl } from "@/components/dosyalar/DosyaAramaUrl";
import { DurumBadge } from "@/components/dosyalar/DurumBadge";
import { OdemeDurumuPicker } from "@/components/operations/OdemeDurumuPicker";
import { BulkActionsBar } from "@/components/operations/BulkActionsBar";
import { DosyaTableRow } from "@/components/operations/DosyaTableRow";
import { MobileBottomSheet } from "@/components/operations/MobileBottomSheet";
import { EmptyState, LoadingState } from "@/components/ui/DataState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatTarih } from "@/lib/utils/format";
import type { ServisDosyasi } from "@/types/servis-dosya";
import type { UserRole } from "@/lib/auth/types";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

interface DosyaListesiClientProps {
  initialDosyalar: ServisDosyasi[];
  arama?: string;
  role: UserRole;
}

export function DosyaListesiClient({
  initialDosyalar,
  arama = "",
  role,
}: DosyaListesiClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialDosyalar);
  const snapshotRef = useRef<Map<string, ServisDosyasi>>(new Map());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheetDosya, setSheetDosya] = useState<ServisDosyasi | null>(null);
  const [, startRefresh] = useTransition();

  useEffect(() => {
    setItems(initialDosyalar);
  }, [initialDosyalar]);

  const aramaAktif = arama.trim().length > 0;

  const onOptimistic = useCallback(
    (id: string, patch: Partial<ServisDosyasi>) => {
      setItems((prev) => {
        const current = prev.find((d) => d.id === id);
        if (current) snapshotRef.current.set(id, current);
        return prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      });
    },
    []
  );

  const onRollback = useCallback((id: string, previous: ServisDosyasi) => {
    setItems((prev) =>
      prev.map((d) => (d.id === id ? previous : d))
    );
    snapshotRef.current.delete(id);
  }, []);

  const onSelect = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const onOptimisticBulk = useCallback(
    (ids: string[], patch: Partial<ServisDosyasi>) => {
      setItems((prev) => {
        for (const id of ids) {
          const current = prev.find((d) => d.id === id);
          if (current && !snapshotRef.current.has(id)) {
            snapshotRef.current.set(id, current);
          }
        }
        return prev.map((d) =>
          ids.includes(d.id) ? { ...d, ...patch } : d
        );
      });
    },
    []
  );

  const onRollbackBulk = useCallback((ids: string[]) => {
    setItems((prev) =>
      prev.map((d) => {
        if (!ids.includes(d.id)) return d;
        const snap = snapshotRef.current.get(d.id);
        return snap ?? d;
      })
    );
    for (const id of ids) snapshotRef.current.delete(id);
  }, []);

  const onComplete = useCallback(() => {
    startRefresh(() => router.refresh());
  }, [router]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const handleMobileSwipe = useCallback(
    (dosya: ServisDosyasi) => {
      setSheetDosya(dosya);
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl flex-1">
          <Suspense fallback={<LoadingState message="Arama hazırlanıyor…" />}>
            <DosyaAramaUrl defaultValue={arama} />
          </Suspense>
        </div>
        <Link href="/dosyalar/yeni">
          <Button className="w-full sm:w-auto">+ Yeni Dosya</Button>
        </Link>
      </div>

      <BulkActionsBar
        selectedCount={selected.size}
        selectedIds={selectedIds}
        role={role}
        onClear={() => setSelected(new Set())}
        onComplete={onComplete}
        onOptimisticBulk={onOptimisticBulk}
        onRollbackBulk={onRollbackBulk}
      />

      {items.length === 0 ? (
        <EmptyState
          title={aramaAktif ? "Sonuç bulunamadı" : "Henüz dosya yok"}
          description={
            aramaAktif
              ? "Plaka veya dosya numarası ile farklı bir arama deneyin."
              : "İlk servis dosyanızı oluşturun."
          }
        />
      ) : (
        <Card className="p-0 md:p-6">
          <div className="p-4 md:p-0">
            <p className="mb-4 text-sm text-ink-muted">
              {items.length} dosya · durum değiştir, not ekle veya detaya git
            </p>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-muted">
                    <th className="pb-3 pr-2 w-8" />
                    <th className="pb-3 pr-4 font-medium">Dosya No</th>
                    <th className="pb-3 pr-4 font-medium">Plaka</th>
                    <th className="pb-3 pr-4 font-medium">Müşteri</th>
                    <th className="pb-3 pr-4 font-medium">Durum</th>
                    <th className="pb-3 pr-4 font-medium">Ödeme / Tutar</th>
                    <th className="pb-3 pr-4 font-medium">Tarih</th>
                    <th className="pb-3 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d) => (
                    <DosyaTableRow
                      key={d.id}
                      dosya={d}
                      role={role}
                      selected={selected.has(d.id)}
                      onSelect={onSelect}
                      onOptimistic={onOptimistic}
                      onRollback={onRollback}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {items.map((d) => (
                <Card
                  key={d.id}
                  className="relative"
                  onClick={() => handleMobileSwipe(d)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{d.dosyaNo}</p>
                      <p className="text-sm text-ink-muted">{d.plaka}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelect(d.id, e.target.checked);
                      }}
                      className="h-4 w-4"
                    />
                  </div>
                  <p className="mt-2 text-sm">{d.musteriAdi}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <DurumBadge durum={d.durum} />
                    <OdemeDurumuPicker
                      dosya={d}
                      onOptimistic={onOptimistic}
                      onRollback={onRollback}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">
                    Ödeme rozetine tıkla · Kart → durum / not ·{" "}
                    {formatTarih(d.olusturulmaTarihi)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      <MobileBottomSheet
        open={!!sheetDosya}
        dosya={sheetDosya}
        role={role}
        onClose={() => setSheetDosya(null)}
        onOptimistic={onOptimistic}
        onRollback={onRollback}
      />
    </div>
  );
}
