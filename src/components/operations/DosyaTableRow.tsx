"use client";

import { memo } from "react";
import Link from "next/link";
import { DurumBadge } from "@/components/dosyalar/DurumBadge";
import { OdemeDurumuPicker } from "@/components/operations/OdemeDurumuPicker";
import { DosyaDeleteButton } from "@/components/operations/DosyaDeleteButton";
import { QuickActions } from "@/components/operations/QuickActions";
import { formatTarih } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ServisDosyasi } from "@/types/servis-dosya";
import type { UserRole } from "@/lib/auth/types";

interface DosyaTableRowProps {
  dosya: ServisDosyasi;
  role: UserRole;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onOptimistic: (id: string, patch: Partial<ServisDosyasi>) => void;
  onRollback: (id: string, previous: ServisDosyasi) => void;
  onSoftDeleted?: (id: string) => void;
  onRestored?: (id: string) => void;
}

export const DosyaTableRow = memo(function DosyaTableRow({
  dosya,
  role,
  selected,
  onSelect,
  onOptimistic,
  onRollback,
  onSoftDeleted,
  onRestored,
}: DosyaTableRowProps) {
  const isAdmin = role === "admin";

  return (
    <tr
      className={cn(
        "group border-b border-border/60 last:border-0 hover:bg-surface-muted/50",
        selected && "bg-accent/5"
      )}
    >
      <td className="py-3 pr-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(dosya.id, e.target.checked)}
          aria-label={`${dosya.dosyaNo} seç`}
          className="h-4 w-4 rounded border-border focus-visible:ring-2 focus-visible:ring-accent"
        />
      </td>
      <td className="py-3 pr-4 font-medium text-ink">{dosya.dosyaNo}</td>
      <td className="py-3 pr-4 text-ink">{dosya.plaka}</td>
      <td className="py-3 pr-4 text-ink-muted">{dosya.musteriAdi}</td>
      <td className="py-3 pr-4">
        <DurumBadge durum={dosya.durum} />
      </td>
      <td className="py-3 pr-4">
        <OdemeDurumuPicker
          dosya={dosya}
          onOptimistic={onOptimistic}
          onRollback={onRollback}
          showTutar
        />
      </td>
      <td className="py-3 pr-4 text-ink-muted">
        {formatTarih(dosya.olusturulmaTarihi)}
      </td>
      <td className="py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dosyalar/${dosya.id}`}
            className="inline-flex h-8 items-center rounded-md bg-accent/10 px-2.5 text-xs font-semibold text-accent hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            Detay
          </Link>
          <div className="opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <QuickActions
              dosya={dosya}
              role={role}
              compact
              onOptimistic={onOptimistic}
              onRollback={onRollback}
            />
          </div>
          {isAdmin ? (
            <DosyaDeleteButton
              dosyaId={dosya.id}
              compact
              onSoftDeleted={onSoftDeleted}
              onRestored={onRestored}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
});
