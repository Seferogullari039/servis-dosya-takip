"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseTutarInput } from "@/lib/utils/para";
import type { OdemeDurumu } from "@/types/servis-dosya";

interface PaymentTutarModalProps {
  open: boolean;
  odemeDurumu: OdemeDurumu;
  defaultValue?: number | null;
  dosyaTutari?: number | null;
  onConfirm: (tutar: number) => void;
  onCancel: () => void;
}

export function PaymentTutarModal({
  open,
  odemeDurumu,
  defaultValue,
  dosyaTutari,
  onConfirm,
  onCancel,
}: PaymentTutarModalProps) {
  const titleId = useId();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initial =
      defaultValue != null && defaultValue > 0
        ? String(defaultValue).replace(".", ",")
        : "";
    setRaw(initial);
    setError(null);
  }, [open, defaultValue, odemeDurumu]);

  if (!open) return null;

  const isFull = odemeDurumu === "Ödendi";
  const label = isFull
    ? "Dosya kapanış tutarı (TL)"
    : "Ödenen tutar (TL)";
  const hint = isFull
    ? "Dosya kapandığında tahsil edilen toplam tutar."
    : dosyaTutari != null && dosyaTutari > 0
      ? `Dosya tutarı: ${dosyaTutari.toLocaleString("tr-TR")} TL`
      : "Kısmi tahsilat tutarını girin.";

  const submit = () => {
    const tutar = parseTutarInput(raw);
    if (tutar == null || (isFull && tutar <= 0)) {
      setError(isFull ? "Geçerli bir tutar girin." : "Geçerli bir tutar girin (0 veya üzeri).");
      return;
    }
    if (
      !isFull &&
      dosyaTutari != null &&
      dosyaTutari > 0 &&
      tutar > dosyaTutari
    ) {
      setError("Ödenen tutar, dosya tutarından büyük olamaz.");
      return;
    }
    onConfirm(tutar);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {isFull ? "Ödeme tamamlandı" : "Kısmi ödeme"}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{hint}</p>

        <div className="mt-4">
          <Input
            label={label}
            name="tutar"
            inputMode="decimal"
            autoFocus
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setError(null);
            }}
            placeholder="ör. 15.000 veya 15000,50"
            error={error ?? undefined}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            İptal
          </Button>
          <Button type="button" onClick={submit}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
