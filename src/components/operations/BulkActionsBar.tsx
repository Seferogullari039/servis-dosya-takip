"use client";

import { memo, useRef, useTransition } from "react";
import {
  bulkAddNote,
  bulkUpdateStatus,
} from "@/app/(dashboard)/dosyalar/actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useActionLock } from "@/hooks/useActionLock";
import { DOSYA_DURUMLARI, type DosyaDurumu, type ServisDosyasi } from "@/types/servis-dosya";
import type { UserRole } from "@/lib/auth/types";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  role: UserRole;
  onClear: () => void;
  onComplete: () => void;
  onOptimisticBulk: (
    ids: string[],
    patch: Partial<ServisDosyasi>
  ) => void;
  onRollbackBulk: (ids: string[]) => void;
}

export const BulkActionsBar = memo(function BulkActionsBar({
  selectedCount,
  selectedIds,
  role,
  onClear,
  onComplete,
  onOptimisticBulk,
  onRollbackBulk,
}: BulkActionsBarProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const { tryLock, unlock } = useActionLock();
  const operationRef = useRef(0);

  if (selectedCount === 0) return null;

  const statusOptions = DOSYA_DURUMLARI.filter(
    (d) => d !== "Kapandı" || role === "admin"
  );

  function handleBulkStatus(durum: DosyaDurumu) {
    if (!tryLock()) return;

    const opId = ++operationRef.current;
    const ids = [...selectedIds];
    onOptimisticBulk(ids, { durum });

    startTransition(async () => {
      try {
        const result = await bulkUpdateStatus(ids, durum);
        if (!result.ok) {
          onRollbackBulk(ids);
          toast(result.error ?? "Toplu güncelleme başarısız.", "error");
        } else {
          toast(`${result.updated ?? 0} dosya güncellendi.`, "success");
          onComplete();
          onClear();
        }
      } finally {
        if (operationRef.current === opId) unlock();
      }
    });
  }

  function handleBulkNote() {
    if (pending) return;
    const text = window.prompt("Tüm seçili dosyalara eklenecek not:");
    if (!text?.trim()) return;
    if (!tryLock()) return;

    const opId = ++operationRef.current;
    const ids = [...selectedIds];

    startTransition(async () => {
      try {
        const result = await bulkAddNote(ids, text);
        if (!result.ok) {
          toast(result.error ?? "Toplu not eklenemedi.", "error");
        } else {
          toast(`${result.updated ?? 0} dosyaya not eklendi.`, "success");
          onComplete();
          onClear();
        }
      } finally {
        if (operationRef.current === opId) unlock();
      }
    });
  }

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 shadow-sm">
      <span className="text-sm font-medium text-ink">
        {selectedCount} dosya seçildi
      </span>
      <select
        className="h-9 rounded-lg border border-border bg-surface px-2 text-sm"
        disabled={pending}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            handleBulkStatus(e.target.value as DosyaDurumu);
            e.target.value = "";
          }
        }}
      >
        <option value="" disabled>
          Toplu durum değiştir
        </option>
        {statusOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <Button variant="secondary" disabled={pending} onClick={handleBulkNote}>
        Toplu not ekle
      </Button>
      <Button variant="ghost" disabled={pending} onClick={onClear}>
        Seçimi temizle
      </Button>
    </div>
  );
});
