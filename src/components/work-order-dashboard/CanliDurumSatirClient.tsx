"use client";

import Link from "next/link";
import { useTransition } from "react";
import { guncelleAracDurumuAction } from "@/app/(dashboard)/is-emirleri/actions";
import { VehicleStatusBadge } from "@/components/is-emri/VehicleStatusBadge";
import { VehicleStatusSelect } from "@/components/is-emri/VehicleStatusSelect";
import { useToast } from "@/components/ui/ToastProvider";
import { formatPara } from "@/lib/utils/para";
import type { CanliIsEmriSatir } from "@/types/work-order-dashboard";
import type { AracDurumu } from "@/types/vehicle-status";

interface CanliDurumSatirClientProps {
  row: CanliIsEmriSatir;
}

export function CanliDurumSatirClient({ row }: CanliDurumSatirClientProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const onStatusChange = (aracDurumu: AracDurumu) => {
    startTransition(async () => {
      const result = await guncelleAracDurumuAction(row.id, aracDurumu);
      if (!result.ok) {
        toast(result.error ?? "Güncellenemedi.", "error");
        return;
      }
      toast("Araç durumu güncellendi.", "success");
    });
  };

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <Link href={`/is-emirleri/${row.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold tracking-wide text-ink">{row.plaka}</span>
          <VehicleStatusBadge durum={row.aracDurumu} size="sm" />
        </div>
        <p className="text-sm text-ink-muted">{row.musteriAdi}</p>
        <p className="text-xs text-ink-faint">{row.isEmriNo}</p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:w-48">
        <p className="text-base font-bold tabular-nums text-accent">
          {formatPara(row.toplamTutar)}
        </p>
        <VehicleStatusSelect
          value={row.aracDurumu}
          onChange={onStatusChange}
          disabled={pending}
          compact
          className="w-full"
        />
      </div>
    </li>
  );
}
