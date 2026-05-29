"use client";

import { memo, useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  addNote,
  updateExpert,
  updateStatus,
} from "@/app/(dashboard)/dosyalar/actions";
import { OdemeDurumuPicker } from "@/components/operations/OdemeDurumuPicker";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useActionLock } from "@/hooks/useActionLock";
import { cn } from "@/lib/utils/cn";
import {
  DOSYA_DURUMLARI,
  type DosyaDurumu,
  type ServisDosyasi,
} from "@/types/servis-dosya";
import type { UserRole } from "@/lib/auth/types";

const inputFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

interface QuickActionsProps {
  dosya: ServisDosyasi;
  role: UserRole;
  compact?: boolean;
  /** Mobile sheet: show detail link in primary group */
  showDetailLink?: boolean;
  onOptimistic: (id: string, patch: Partial<ServisDosyasi>) => void;
  onRollback: (id: string, previous: ServisDosyasi) => void;
  className?: string;
}

export const QuickActions = memo(function QuickActions({
  dosya,
  role,
  compact = false,
  showDetailLink = false,
  onOptimistic,
  onRollback,
  className,
}: QuickActionsProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const { tryLock, unlock } = useActionLock();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expertOpen, setExpertOpen] = useState(false);
  const [expertName, setExpertName] = useState(dosya.eksperAdi);
  const dosyaRef = useRef(dosya);
  dosyaRef.current = dosya;

  const run = useCallback(
    (
      patch: Partial<ServisDosyasi>,
      action: () => Promise<{ ok: boolean; error?: string }>
    ) => {
      if (!tryLock()) return;

      const current = dosyaRef.current;
      const prev = { ...current };
      onOptimistic(current.id, patch);

      startTransition(async () => {
        try {
          const result = await action();
          if (!result.ok) {
            onRollback(current.id, prev);
            toast(result.error ?? "İşlem başarısız.", "error");
          } else {
            toast("Güncellendi.", "success");
          }
        } finally {
          unlock();
        }
      });
    },
    [onOptimistic, onRollback, toast, tryLock, unlock]
  );

  const selectClass = cn(
    "h-8 rounded-md border border-border bg-surface px-2 text-xs text-ink",
    inputFocusClass,
    compact && "max-w-[140px]"
  );

  const isDisabled = pending;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label={`Hızlı işlemler — ${dosya.dosyaNo}`}
    >
      {/* Primary: durum + ödeme + not (+ detay on mobile) */}
      <select
        className={cn(selectClass, "border-accent/40 font-medium")}
        value={dosya.durum}
        disabled={isDisabled}
        aria-label="Durum değiştir"
        onChange={(e) =>
          run({ durum: e.target.value as DosyaDurumu }, () =>
            updateStatus(dosya.id, e.target.value as DosyaDurumu)
          )
        }
      >
        {DOSYA_DURUMLARI.filter(
          (d) => d !== "Kapandı" || role === "admin"
        ).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <OdemeDurumuPicker
        dosya={dosya}
        onOptimistic={onOptimistic}
        onRollback={onRollback}
      />

      <Button
        type="button"
        variant="secondary"
        className="h-8 px-2.5 text-xs"
        disabled={isDisabled}
        onClick={() => setNoteOpen(true)}
      >
        Not ekle
      </Button>

      {showDetailLink && (
        <Link
          href={`/dosyalar/${dosya.id}`}
          className={cn(
            "inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-accent hover:bg-surface-muted",
            inputFocusClass
          )}
        >
          Detay
        </Link>
      )}

      {/* Advanced menu */}
      <button
        type="button"
        disabled={isDisabled}
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((v) => !v)}
        className={cn(
          "h-8 rounded-md px-2 text-xs text-ink-muted hover:bg-surface-muted hover:text-ink",
          inputFocusClass
        )}
      >
        {advancedOpen ? "Gizle" : "Diğer"}
      </button>

      {advancedOpen && (
        <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
          {role === "admin" && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              disabled={isDisabled}
              onClick={() => {
                setExpertName(dosya.eksperAdi);
                setExpertOpen(true);
              }}
            >
              Eksper
            </Button>
          )}
        </div>
      )}

      {noteOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-xl bg-surface p-4 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-dialog-title"
          >
            <p id="note-dialog-title" className="font-medium text-ink">
              Not ekle — {dosya.dosyaNo}
            </p>
            <textarea
              className={cn(
                "mt-3 min-h-[80px] w-full rounded-lg border border-border p-2 text-sm",
                inputFocusClass
              )}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Kısa not…"
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setNoteOpen(false);
                  setNoteText("");
                }}
              >
                İptal
              </Button>
              <Button
                disabled={isDisabled || !noteText.trim()}
                onClick={() => {
                  const text = noteText;
                  setNoteOpen(false);
                  setNoteText("");
                  run({}, () => addNote(dosya.id, text));
                }}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {expertOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-surface p-4 shadow-lg" role="dialog">
            <p className="font-medium text-ink">Eksper — {dosya.dosyaNo}</p>
            <input
              className={cn(
                "mt-3 h-10 w-full rounded-lg border border-border px-3 text-sm",
                inputFocusClass
              )}
              value={expertName}
              onChange={(e) => setExpertName(e.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setExpertOpen(false)}>
                İptal
              </Button>
              <Button
                disabled={isDisabled}
                onClick={() => {
                  setExpertOpen(false);
                  run({ eksperAdi: expertName }, () =>
                    updateExpert(dosya.id, expertName)
                  );
                }}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
