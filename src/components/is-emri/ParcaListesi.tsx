"use client";

import { TedarikDurumBadge } from "@/components/is-emri/TedarikDurumBadge";
import {
  fieldClass,
  labelClass,
  mutedHintClass,
  tableHeadClass,
} from "@/components/is-emri/is-emri-form-ui";
import {
  calcParcaSatirToplam,
  syncParcaToplamFiyat,
} from "@/lib/is-emri/calculations";
import { formatPara } from "@/lib/utils/para";
import {
  createEmptyParcaSatir,
  type ParcaSatir,
} from "@/types/is-emri";
import {
  TEDARIK_DURUMLARI,
  type TedarikDurumu,
} from "@/types/tedarik";
import { cn } from "@/lib/utils/cn";

interface ParcaListesiProps {
  parcalar: ParcaSatir[];
  readOnly: boolean;
  onChange: (parcalar: ParcaSatir[]) => void;
  inputProps: (editable: boolean) => Record<string, unknown>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ParcaListesi({
  parcalar,
  readOnly,
  onChange,
  inputProps,
}: ParcaListesiProps) {
  const patchParca = (id: string, patch: Partial<ParcaSatir>) => {
    onChange(
      parcalar.map((r) => {
        if (r.id !== id) return r;
        let next = { ...r, ...patch };
        if (patch.servisSatinAldi === true) {
          next.tedarikDurumu = "Servis Satın Aldı";
        }
        if (
          patch.tedarikDurumu === "Geldi" ||
          (patch.tedarikDurumu && next.tedarikDurumu === "Geldi")
        ) {
          if (!next.geldiTarihi) next.geldiTarihi = todayIso();
        }
        if (patch.tedarikDurumu === "Servis Satın Aldı") {
          next.servisSatinAldi = true;
        }
        return syncParcaToplamFiyat(next);
      })
    );
  };

  const addParca = () => onChange([...parcalar, createEmptyParcaSatir()]);
  const removeParca = (id: string) => {
    if (parcalar.length <= 1) return;
    onChange(parcalar.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className={labelClass()}>Sigorta tedarik parça listesi</label>
          <p className={mutedHintClass()}>
            Hasar dosyası parça takibi · fiyatlar otomatik hesaplanır
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            className="no-print min-h-11 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-semibold text-accent"
            onClick={addParca}
          >
            + Parça ekle
          </button>
        ) : null}
      </div>

      <ul className="space-y-4 lg:hidden">
        {parcalar.map((row) => (
          <ParcaMobileCard
            key={row.id}
            row={row}
            readOnly={readOnly}
            patchParca={patchParca}
            removeParca={removeParca}
            inputProps={inputProps}
            canRemove={parcalar.length > 1}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className={tableHeadClass()}>
            <tr>
              <th className="px-2 py-2 font-semibold">Parça</th>
              <th className="w-14 px-2 py-2">Adet</th>
              <th className="w-24 px-2 py-2 text-right">Birim ₺</th>
              <th className="w-24 px-2 py-2 text-right">Toplam</th>
              <th className="w-40 px-2 py-2">Tedarik durumu</th>
              <th className="w-28 px-2 py-2">Tedarik trh.</th>
              <th className="w-28 px-2 py-2">Geldi trh.</th>
              <th className="w-20 px-2 py-2 text-center">Servis aldı</th>
              <th className="min-w-[120px] px-2 py-2">Not</th>
              <th className="no-print w-8" />
            </tr>
          </thead>
          <tbody>
            {parcalar.map((row) => {
              const satirToplam = calcParcaSatirToplam(row);
              return (
                <tr key={row.id} className="border-t border-border/60 align-top">
                  <td className="px-2 py-2">
                    <input
                      className={fieldClass()}
                      value={row.parcaAdi}
                      onChange={(e) =>
                        patchParca(row.id, { parcaAdi: e.target.value })
                      }
                      placeholder="Parça adı"
                      {...inputProps(true)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={cn(fieldClass(), "text-center")}
                      value={row.adet}
                      onChange={(e) => patchParca(row.id, { adet: e.target.value })}
                      {...inputProps(true)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={cn(fieldClass(), "text-right")}
                      value={row.birimFiyat}
                      onChange={(e) =>
                        patchParca(row.id, { birimFiyat: e.target.value })
                      }
                      {...inputProps(true)}
                    />
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">
                    {formatPara(satirToplam)}
                  </td>
                  <td className="px-2 py-2">
                    {readOnly ? (
                      <TedarikDurumBadge durum={row.tedarikDurumu} size="sm" />
                    ) : (
                      <select
                        className={cn(fieldClass(), "min-h-11 text-xs")}
                        value={row.tedarikDurumu}
                        onChange={(e) =>
                          patchParca(row.id, {
                            tedarikDurumu: e.target.value as TedarikDurumu,
                          })
                        }
                      >
                        {TEDARIK_DURUMLARI.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className={fieldClass()}
                      value={row.tedarikTarihi}
                      onChange={(e) =>
                        patchParca(row.id, { tedarikTarihi: e.target.value })
                      }
                      {...inputProps(true)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className={fieldClass()}
                      value={row.geldiTarihi}
                      onChange={(e) =>
                        patchParca(row.id, { geldiTarihi: e.target.value })
                      }
                      {...inputProps(true)}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.servisSatinAldi}
                      disabled={readOnly}
                      className="h-6 w-6 rounded text-violet-600"
                      onChange={(e) =>
                        patchParca(row.id, { servisSatinAldi: e.target.checked })
                      }
                      aria-label="Servis satın aldı"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className={fieldClass()}
                      value={row.tedarikNotu}
                      onChange={(e) =>
                        patchParca(row.id, { tedarikNotu: e.target.value })
                      }
                      placeholder="Tedarik notu"
                      {...inputProps(true)}
                    />
                  </td>
                  {!readOnly ? (
                    <td className="no-print px-1 py-2">
                      <button
                        type="button"
                        className="rounded p-1 text-ink-faint hover:text-red-600"
                        onClick={() => removeParca(row.id)}
                        aria-label="Sil"
                      >
                        ×
                      </button>
                    </td>
                  ) : (
                    <td className="no-print" />
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function ParcaMobileCard({
  row,
  readOnly,
  patchParca,
  removeParca,
  inputProps,
  canRemove,
}: {
  row: ParcaSatir;
  readOnly: boolean;
  patchParca: (id: string, patch: Partial<ParcaSatir>) => void;
  removeParca: (id: string) => void;
  inputProps: (editable: boolean) => Record<string, unknown>;
  canRemove: boolean;
}) {
  const satirToplam = calcParcaSatirToplam(row);
  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <input
        className={cn(fieldClass(), "font-medium")}
        value={row.parcaAdi}
        onChange={(e) => patchParca(row.id, { parcaAdi: e.target.value })}
        placeholder="Parça adı"
        {...inputProps(true)}
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <span className={mutedHintClass()}>Adet</span>
          <input
            className={cn(fieldClass(), "mt-1")}
            value={row.adet}
            onChange={(e) => patchParca(row.id, { adet: e.target.value })}
            {...inputProps(true)}
          />
        </div>
        <div>
          <span className={mutedHintClass()}>Birim (₺)</span>
          <input
            className={cn(fieldClass(), "mt-1 text-right")}
            value={row.birimFiyat}
            onChange={(e) => patchParca(row.id, { birimFiyat: e.target.value })}
            {...inputProps(true)}
          />
        </div>
      </div>
      <p className="mt-2 text-right text-sm font-bold tabular-nums">
        Toplam: {formatPara(satirToplam)}
      </p>
      <div className="mt-3">
        <TedarikDurumBadge durum={row.tedarikDurumu} />
        {!readOnly ? (
          <select
            className={cn(fieldClass(), "mt-2 min-h-12 text-base")}
            value={row.tedarikDurumu}
            onChange={(e) =>
              patchParca(row.id, {
                tedarikDurumu: e.target.value as TedarikDurumu,
              })
            }
          >
            {TEDARIK_DURUMLARI.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <span className={mutedHintClass()}>Tedarik tarihi</span>
          <input
            type="date"
            className={cn(fieldClass(), "mt-1 min-h-11")}
            value={row.tedarikTarihi}
            onChange={(e) =>
              patchParca(row.id, { tedarikTarihi: e.target.value })
            }
            {...inputProps(true)}
          />
        </div>
        <div>
          <span className={mutedHintClass()}>Geldi tarihi</span>
          <input
            type="date"
            className={cn(fieldClass(), "mt-1 min-h-11")}
            value={row.geldiTarihi}
            onChange={(e) => patchParca(row.id, { geldiTarihi: e.target.value })}
            {...inputProps(true)}
          />
        </div>
      </div>
      <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          checked={row.servisSatinAldi}
          disabled={readOnly}
          className="h-6 w-6 shrink-0 rounded text-violet-600"
          onChange={(e) =>
            patchParca(row.id, { servisSatinAldi: e.target.checked })
          }
        />
        <span className="text-sm font-medium">Servis satın aldı</span>
      </label>
      <input
        className={cn(fieldClass(), "mt-2")}
        value={row.tedarikNotu}
        onChange={(e) => patchParca(row.id, { tedarikNotu: e.target.value })}
        placeholder="Tedarik notu"
        {...inputProps(true)}
      />
      {!readOnly && canRemove ? (
        <button
          type="button"
          className="no-print mt-2 text-xs font-semibold text-red-600"
          onClick={() => removeParca(row.id)}
        >
          Satırı sil
        </button>
      ) : null}
    </li>
  );
}
