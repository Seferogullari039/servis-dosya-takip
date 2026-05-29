"use client";

import { fieldClass, labelClass } from "@/components/is-emri/is-emri-form-ui";
import { calcIscilikToplam } from "@/lib/is-emri/calculations";
import { formatPara, parseTutarInput } from "@/lib/utils/para";
import { createEmptyIscilikSatir, type IscilikSatir } from "@/types/is-emri";
import { cn } from "@/lib/utils/cn";

interface IscilikListesiProps {
  satirlar: IscilikSatir[];
  readOnly: boolean;
  onChange: (satirlar: IscilikSatir[]) => void;
  inputProps: (editable: boolean) => Record<string, unknown>;
}

export function IscilikListesi({
  satirlar,
  readOnly,
  onChange,
  inputProps,
}: IscilikListesiProps) {
  const patch = (id: string, field: keyof IscilikSatir, value: string) => {
    onChange(
      satirlar.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const add = () => onChange([...satirlar, createEmptyIscilikSatir()]);
  const remove = (id: string) => {
    if (satirlar.length <= 1) return;
    onChange(satirlar.filter((r) => r.id !== id));
  };

  const toplam = calcIscilikToplam(satirlar);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className={labelClass()}>İşçilik kalemleri</label>
        {!readOnly ? (
          <button
            type="button"
            className="no-print text-xs font-semibold text-accent hover:underline"
            onClick={add}
          >
            + Satır ekle
          </button>
        ) : null}
      </div>

      <ul className="space-y-3 md:hidden">
        {satirlar.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <input
              className={fieldClass()}
              value={row.aciklama}
              onChange={(e) => patch(row.id, "aciklama", e.target.value)}
              placeholder="İşçilik açıklaması"
              {...inputProps(true)}
            />
            <input
              className={cn(fieldClass(), "mt-2 text-right font-semibold")}
              inputMode="decimal"
              value={row.tutar}
              onChange={(e) => patch(row.id, "tutar", e.target.value)}
              placeholder="₺ 0"
              {...inputProps(true)}
            />
            {!readOnly ? (
              <button
                type="button"
                className="no-print mt-2 text-xs text-red-600"
                onClick={() => remove(row.id)}
              >
                Satırı sil
              </button>
            ) : null}
          </li>
        ))}
        <li className="text-right text-sm font-bold tabular-nums">
          Toplam: {formatPara(toplam)}
        </li>
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted print:bg-gray-100">
            <tr>
              <th className="px-3 py-2 font-semibold">İşçilik açıklaması</th>
              <th className="w-32 px-3 py-2 text-right font-semibold">
                Tutar (₺)
              </th>
              <th className="no-print w-10" />
            </tr>
          </thead>
          <tbody>
            {satirlar.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                <td className="px-2 py-1.5">
                  <input
                    className={cn(fieldClass(), "text-sm")}
                    value={row.aciklama}
                    onChange={(e) => patch(row.id, "aciklama", e.target.value)}
                    placeholder="Örn. Kaporta işçiliği"
                    {...inputProps(true)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={cn(fieldClass(), "text-right text-sm")}
                    inputMode="decimal"
                    value={row.tutar}
                    onChange={(e) => patch(row.id, "tutar", e.target.value)}
                    placeholder="0"
                    {...inputProps(true)}
                  />
                </td>
                {!readOnly ? (
                  <td className="no-print px-1 py-1.5">
                    <button
                      type="button"
                      className="rounded p-1 text-ink-faint hover:text-red-600"
                      onClick={() => remove(row.id)}
                      aria-label="Satırı sil"
                    >
                      ×
                    </button>
                  </td>
                ) : (
                  <td className="no-print w-10" />
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-surface-muted/50">
              <td className="px-3 py-2 text-right text-xs font-semibold uppercase">
                İşçilik toplamı
              </td>
              <td className="px-3 py-2 text-right font-bold tabular-nums">
                {formatPara(toplam)}
              </td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
