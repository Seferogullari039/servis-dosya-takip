"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { parseBulkParcaImport } from "@/lib/is-emri/bulk-import-parca";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import { buildParcaSatirFromQuickEntry } from "@/lib/is-emri/parca-tedarik-helpers";
import { formatPara } from "@/lib/utils/para";
import { useToast } from "@/components/ui/ToastProvider";
import {
  createEmptyIscilikSatir,
  type IscilikSatir,
  type ParcaSatir,
} from "@/types/is-emri";
import {
  DEFAULT_TEDARIK_DURUMU,
  TEDARIK_DURUMLARI,
  type TedarikDurumu,
} from "@/types/tedarik";

export interface HizliParcaIscilikAppendPayload {
  parcalar?: ParcaSatir[];
  iscilik?: IscilikSatir[];
}

interface HizliParcaIscilikGirisProps {
  readOnly: boolean;
  onAppend: (payload: HizliParcaIscilikAppendPayload) => void;
}

const BULK_PLACEHOLDER = `Ön Tampon;1;4500
Sol Far;1;6000
Kaput;1;8000`;

const initialQuickPart = {
  parcaAdi: "",
  adet: "1",
  birimFiyat: "",
  geldi: false,
  tedarikDurumu: DEFAULT_TEDARIK_DURUMU as TedarikDurumu,
  tedarikNotu: "",
};

const initialQuickLabor = {
  aciklama: "",
  tutar: "",
};

export function HizliParcaIscilikGiris({
  readOnly,
  onAppend,
}: HizliParcaIscilikGirisProps) {
  const { toast } = useToast();
  const [quickPart, setQuickPart] = useState(initialQuickPart);
  const [quickLabor, setQuickLabor] = useState(initialQuickLabor);
  const [bulkText, setBulkText] = useState("");
  const [bulkErrors, setBulkErrors] = useState<
    { line: number; text: string; message: string }[]
  >([]);

  const quickPartToplam = useMemo(() => {
    const draft = buildParcaSatirFromQuickEntry({
      parcaAdi: quickPart.parcaAdi || " ",
      adet: quickPart.adet,
      birimFiyat: quickPart.birimFiyat,
      geldi: quickPart.geldi,
      tedarikDurumu: quickPart.tedarikDurumu,
      tedarikNotu: quickPart.tedarikNotu,
    });
    if (!draft || !quickPart.parcaAdi.trim()) return "";
    return formatPara(calcParcaSatirToplam(draft));
  }, [quickPart]);

  const patchQuickPart = useCallback(
    (patch: Partial<typeof initialQuickPart>) => {
      setQuickPart((prev) => {
        let next = { ...prev, ...patch };

        if (patch.geldi === true) {
          next.tedarikDurumu = "Geldi";
        } else if (patch.geldi === false && prev.tedarikDurumu === "Geldi") {
          next.tedarikDurumu = DEFAULT_TEDARIK_DURUMU;
        }

        if (patch.tedarikDurumu && patch.tedarikDurumu !== "Geldi") {
          next.geldi = false;
        }
        if (patch.tedarikDurumu === "Geldi") {
          next.geldi = true;
        }

        return next;
      });
    },
    []
  );

  const handleBulkImport = useCallback(() => {
    const trimmed = bulkText.trim();
    if (!trimmed) {
      toast("Yapıştırılacak liste boş.", "info");
      return;
    }

    const { rows, errors } = parseBulkParcaImport(trimmed);
    setBulkErrors(errors);

    if (rows.length === 0) {
      toast("Geçerli satır bulunamadı.", "error");
      return;
    }

    onAppend({ parcalar: rows });

    if (errors.length > 0) {
      toast(
        `${rows.length} satır eklendi, ${errors.length} satır hatalı.`,
        "info"
      );
    } else {
      toast(
        `${rows.length} parça iş emrine aktarıldı. Kalıcı kayıt için Kaydet'e basın.`,
        "success"
      );
      setBulkText("");
      setBulkErrors([]);
    }
  }, [bulkText, onAppend, toast]);

  const handleApplyQuickEntry = useCallback(() => {
    const parcaRow = buildParcaSatirFromQuickEntry(quickPart);
    const hasLabor =
      quickLabor.aciklama.trim().length > 0 || quickLabor.tutar.trim().length > 0;

    let iscilikRow: IscilikSatir | null = null;
    if (hasLabor) {
      if (!quickLabor.aciklama.trim()) {
        toast("İşçilik açıklaması girin.", "info");
        return;
      }
      if (!quickLabor.tutar.trim()) {
        toast("İşçilik tutarı girin.", "info");
        return;
      }
      iscilikRow = {
        ...createEmptyIscilikSatir(),
        aciklama: quickLabor.aciklama.trim(),
        tutar: quickLabor.tutar.trim(),
      };
    }

    if (!parcaRow && !iscilikRow) {
      toast("En az bir parça veya işçilik satırı girin.", "info");
      return;
    }

    onAppend({
      parcalar: parcaRow ? [parcaRow] : undefined,
      iscilik: iscilikRow ? [iscilikRow] : undefined,
    });

    setQuickPart(initialQuickPart);
    setQuickLabor(initialQuickLabor);

    const parts: string[] = [];
    if (parcaRow) parts.push("parça");
    if (iscilikRow) parts.push("işçilik");
    toast(`${parts.join(" ve ")} iş emrine eklendi.`, "success");
  }, [onAppend, quickLabor, quickPart, toast]);

  if (readOnly) return null;

  return (
    <section className="rounded-xl border border-accent/25 bg-accent/5 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-ink">
          Hızlı Parça &amp; İşçilik Girişi
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          Tek satır veya toplu yapıştırma ile parça/işçilik ekleyin. Aktarılan
          satırlar aşağıdaki iş emri listesine eklenir. Kalıcı kayıt için
          sayfanın altındaki Kaydet butonunu kullanın.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-3 text-sm font-medium text-ink">Hızlı parça satırı</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Parça adı"
              value={quickPart.parcaAdi}
              onChange={(e) => patchQuickPart({ parcaAdi: e.target.value })}
              placeholder="Örn. Ön tampon"
            />
            <Input
              label="Adet"
              inputMode="decimal"
              value={quickPart.adet}
              onChange={(e) => patchQuickPart({ adet: e.target.value })}
            />
            <Input
              label="Birim fiyat"
              inputMode="decimal"
              value={quickPart.birimFiyat}
              onChange={(e) => patchQuickPart({ birimFiyat: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Toplam"
              value={quickPartToplam}
              readOnly
              tabIndex={-1}
              className="bg-surface-muted"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm">
              <input
                type="checkbox"
                checked={quickPart.geldi}
                onChange={(e) => patchQuickPart({ geldi: e.target.checked })}
                className="size-4 rounded border-border text-accent focus:ring-accent"
              />
              <span>Geldi</span>
            </label>
            <Select
              label="Tedarik durumu"
              options={TEDARIK_DURUMLARI}
              value={quickPart.tedarikDurumu}
              onChange={(e) =>
                patchQuickPart({
                  tedarikDurumu: e.target.value as TedarikDurumu,
                })
              }
            />
            <Input
              label="Not"
              value={quickPart.tedarikNotu}
              onChange={(e) => patchQuickPart({ tedarikNotu: e.target.value })}
              placeholder="Tedarik notu"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-ink">Hızlı işçilik satırı</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Açıklama"
              value={quickLabor.aciklama}
              onChange={(e) =>
                setQuickLabor((prev) => ({ ...prev, aciklama: e.target.value }))
              }
              placeholder="Örn. Boya işçiliği"
            />
            <Input
              label="Tutar"
              inputMode="decimal"
              value={quickLabor.tutar}
              onChange={(e) =>
                setQuickLabor((prev) => ({ ...prev, tutar: e.target.value }))
              }
              placeholder="0"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={handleApplyQuickEntry}>
              Tek Satırı İş Emrine Aktar
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-ink">
            Toplu Yapıştır / İçeri Aktar
          </p>
          <p className="mb-3 text-xs text-ink-muted">
            Her satır: Parça Adı;Adet;Birim Fiyat (noktalı virgül ile)
          </p>
          <Textarea
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              if (bulkErrors.length > 0) setBulkErrors([]);
            }}
            placeholder={BULK_PLACEHOLDER}
            rows={5}
            className="font-mono text-sm"
          />
          {bulkErrors.length > 0 && (
            <ul className="mt-2 space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {bulkErrors.map((err) => (
                <li key={`${err.line}-${err.text}`}>
                  <span className="font-medium">Satır {err.line}:</span>{" "}
                  {err.message}
                  {err.text ? (
                    <span className="block truncate font-mono text-xs opacity-80">
                      {err.text}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={handleBulkImport}>
              Toplu Listeyi İş Emrine Aktar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
