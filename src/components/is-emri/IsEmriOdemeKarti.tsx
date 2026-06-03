"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { formatPara } from "@/lib/utils/para";
import { parseTutarInput } from "@/lib/utils/para";
import type { IsEmriFormState } from "@/types/is-emri";
import {
  IS_EMRI_ODEME_DURUMLARI,
  calcKalanTutar,
  syncIsEmriDurumuFromOdeme,
} from "@/types/work-order-payment";
import { cn } from "@/lib/utils/cn";
import {
  fieldClass,
  labelClass,
} from "@/components/is-emri/is-emri-form-ui";

interface IsEmriOdemeKartiProps {
  form: IsEmriFormState;
  genelToplam: number;
  onPatch: <K extends keyof IsEmriFormState>(
    key: K,
    value: IsEmriFormState[K]
  ) => void;
}

export function IsEmriOdemeKarti({
  form,
  genelToplam,
  onPatch,
}: IsEmriOdemeKartiProps) {
  const tahsil = parseTutarInput(form.tahsilEdilenTutar) ?? 0;
  const kalan = useMemo(
    () => calcKalanTutar(genelToplam, tahsil),
    [genelToplam, tahsil]
  );
  const sigortasiz = form.isEmriTipi === "Sigortasız / Müşteri Ödemeli İş";

  const handleOdemeDurumu = (value: IsEmriFormState["odemeDurumu"]) => {
    onPatch("odemeDurumu", value);
    onPatch(
      "isEmriDurumu",
      syncIsEmriDurumuFromOdeme(value, form.isEmriDurumu)
    );
    if (value === "Ödendi" && genelToplam > 0) {
      onPatch("tahsilEdilenTutar", String(genelToplam));
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        sigortasiz
          ? "border-amber-300 bg-amber-50/80 shadow-sm dark:border-amber-700 dark:bg-amber-950/30"
          : "border-border bg-surface-muted/30"
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            className={cn(
              "text-sm font-bold uppercase tracking-wide",
              sigortasiz ? "text-amber-900 dark:text-amber-200" : "text-ink"
            )}
          >
            Ödeme takibi
          </h3>
          {sigortasiz ? (
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
              Sigortasız iş — müşteri tahsilatı takip edilir.
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-muted">
              Sigortalı iş — ödeme durumu kayıt altında tutulur.
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-muted">Genel toplam</p>
          <p className="text-lg font-bold tabular-nums text-ink">
            {formatPara(genelToplam)}
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Ödeme durumu"
          options={IS_EMRI_ODEME_DURUMLARI}
          value={form.odemeDurumu}
          onChange={(e) =>
            handleOdemeDurumu(
              e.target.value as IsEmriFormState["odemeDurumu"]
            )
          }
        />
        <div>
          <label className={labelClass()}>Tahsil edilen tutar (TL)</label>
          <input
            className={fieldClass()}
            value={form.tahsilEdilenTutar}
            onChange={(e) => onPatch("tahsilEdilenTutar", e.target.value)}
            placeholder="0"
            inputMode="decimal"
          />
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <p className="text-xs font-medium text-ink-muted">Kalan tutar</p>
          <p className="mt-1 text-base font-bold tabular-nums text-ink">
            {formatPara(kalan)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <p className="text-xs font-medium text-ink-muted">İş emri durumu</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {form.isEmriDurumu}
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass()}>Ödeme notu</label>
        <textarea
          className={cn(fieldClass(), "min-h-[72px]")}
          rows={2}
          value={form.odemeNotu}
          onChange={(e) => onPatch("odemeNotu", e.target.value)}
          placeholder="Tahsilat / fatura / müşteri notu…"
        />
      </div>
    </div>
  );
}
