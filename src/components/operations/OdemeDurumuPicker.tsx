"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePayment } from "@/app/(dashboard)/dosyalar/actions";
import { PaymentTutarModal } from "@/components/operations/PaymentTutarModal";
import { odemeBadgeVariant } from "@/components/dosyalar/DurumBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { useActionLock } from "@/hooks/useActionLock";
import { cn } from "@/lib/utils/cn";
import { formatParaOzet } from "@/lib/utils/para";
import {
  ODEME_DURUMLARI,
  type OdemeDurumu,
  type ServisDosyasi,
} from "@/types/servis-dosya";

interface OdemeDurumuPickerProps {
  dosya: ServisDosyasi;
  onOptimistic?: (id: string, patch: Partial<ServisDosyasi>) => void;
  onRollback?: (id: string, previous: ServisDosyasi) => void;
  className?: string;
  showTutar?: boolean;
}

export function OdemeDurumuPicker({
  dosya,
  onOptimistic,
  onRollback,
  className,
  showTutar = false,
}: OdemeDurumuPickerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [modalDurum, setModalDurum] = useState<OdemeDurumu | null>(null);
  const [pending, startTransition] = useTransition();
  const { tryLock, unlock } = useActionLock();
  const rootRef = useRef<HTMLDivElement>(null);
  const dosyaRef = useRef(dosya);
  dosyaRef.current = dosya;
  const { id: dosyaId, odemeDurumu } = dosya;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const applyPayment = useCallback(
    (next: OdemeDurumu, tutar?: number) => {
      if (!tryLock()) return;

      const current = dosyaRef.current;
      const prev = { ...current };
      const patch: Partial<ServisDosyasi> = { odemeDurumu: next };

      if (next === "Ödenmedi") {
        patch.odenenTutar = 0;
      } else if (next === "Ödendi" && tutar != null) {
        patch.dosyaTutari = tutar;
        patch.odenenTutar = tutar;
      } else if (next === "Kısmi Ödendi" && tutar != null) {
        patch.odenenTutar = tutar;
      }

      onOptimistic?.(dosyaId, patch);
      setOpen(false);
      setModalDurum(null);

      startTransition(async () => {
        try {
          const result = await updatePayment(dosyaId, next, tutar);
          if (!result.ok) {
            if (onRollback) onRollback(dosyaId, prev);
            toast(result.error ?? "Ödeme güncellenemedi.", "error");
          } else {
            toast(`Ödeme: ${next}`, "success");
            if (!onOptimistic) router.refresh();
          }
        } finally {
          unlock();
        }
      });
    },
    [dosyaId, onOptimistic, onRollback, router, toast, tryLock, unlock]
  );

  const select = useCallback(
    (next: OdemeDurumu) => {
      if (next === odemeDurumu) {
        setOpen(false);
        return;
      }
      if (next === "Ödendi" || next === "Kısmi Ödendi") {
        setOpen(false);
        setModalDurum(next);
        return;
      }
      applyPayment(next);
    },
    [applyPayment, odemeDurumu]
  );

  const tutarOzet = formatParaOzet(dosya.odenenTutar, dosya.dosyaTutari);
  const modalDefault =
    modalDurum === "Ödendi"
      ? dosya.dosyaTutari ?? dosya.odenenTutar
      : dosya.odenenTutar;

  return (
    <>
      <div
        ref={rootRef}
        className={cn(
          "relative inline-flex flex-col items-start gap-0.5",
          className
        )}
      >
        <button
          type="button"
          disabled={pending}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Ödeme durumu: ${odemeDurumu}. Değiştirmek için tıklayın`}
          title="Ödeme durumunu değiştir"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:opacity-50",
            odemeBadgeVariant[odemeDurumu]
          )}
        >
          {odemeDurumu}
          <span className="text-[10px] opacity-70" aria-hidden>
            ▾
          </span>
        </button>

        {showTutar && tutarOzet !== "—" && (
          <span className="text-xs font-medium text-ink-muted">{tutarOzet}</span>
        )}

        {open && (
          <ul
            role="listbox"
            aria-label="Ödeme durumu seçenekleri"
            className="absolute left-0 top-full z-30 mt-1 min-w-[10.5rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {ODEME_DURUMLARI.map((o) => (
              <li key={o} role="option" aria-selected={o === odemeDurumu}>
                <button
                  type="button"
                  disabled={pending}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-surface-muted",
                    o === odemeDurumu && "bg-accent/10 font-medium text-accent"
                  )}
                  onClick={() => select(o)}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PaymentTutarModal
        open={modalDurum != null}
        odemeDurumu={modalDurum ?? "Ödendi"}
        defaultValue={modalDefault}
        dosyaTutari={dosya.dosyaTutari}
        onCancel={() => setModalDurum(null)}
        onConfirm={(tutar) => {
          if (modalDurum) applyPayment(modalDurum, tutar);
        }}
      />
    </>
  );
}
