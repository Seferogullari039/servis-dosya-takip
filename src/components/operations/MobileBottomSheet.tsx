"use client";

import Link from "next/link";
import { QuickActions } from "@/components/operations/QuickActions";
import { Button } from "@/components/ui/Button";
import type { ServisDosyasi } from "@/types/servis-dosya";
import type { UserRole } from "@/lib/auth/types";

interface MobileBottomSheetProps {
  open: boolean;
  dosya: ServisDosyasi | null;
  role: UserRole;
  onClose: () => void;
  onOptimistic: (id: string, patch: Partial<ServisDosyasi>) => void;
  onRollback: (id: string, previous: ServisDosyasi) => void;
}

export function MobileBottomSheet({
  open,
  dosya,
  role,
  onClose,
  onOptimistic,
  onRollback,
}: MobileBottomSheetProps) {
  if (!open || !dosya) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${dosya.dosyaNo} hızlı işlemler`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink">{dosya.dosyaNo}</p>
            <p className="text-sm text-ink-muted">{dosya.plaka}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Kapat
          </Button>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Sık kullanılan
        </p>
        <QuickActions
          dosya={dosya}
          role={role}
          showDetailLink
          onOptimistic={onOptimistic}
          onRollback={onRollback}
        />

        <div className="mt-4 border-t border-border pt-3">
          <Link
            href={`/dosyalar/${dosya.id}`}
            className="block rounded-lg border border-border px-3 py-2.5 text-center text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={onClose}
          >
            Dosya detayına git
          </Link>
        </div>
      </div>
    </div>
  );
}
