"use client";



import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import { IsEmriOdemeKarti } from "@/components/is-emri/IsEmriOdemeKarti";
import { IsEmriPrintDocument } from "@/components/is-emri/IsEmriPrintDocument";

import { VehicleStatusSelect } from "@/components/is-emri/VehicleStatusSelect";

import { WetSignatureBlock } from "@/components/is-emri/WetSignatureBlock";

import { EkspertizChecklist } from "@/components/is-emri/EkspertizChecklist";

import {
  HizliParcaIscilikGiris,
  type HizliParcaIscilikAppendPayload,
} from "@/components/is-emri/HizliParcaIscilikGiris";
import { IscilikListesi } from "@/components/is-emri/IscilikListesi";

import { IsEmriToplamKartlari } from "@/components/is-emri/IsEmriToplamKartlari";

import { ParcaListesi } from "@/components/is-emri/ParcaListesi";

import {

  fieldClass,

  inputPropsForMode,

  labelClass,

  IsEmriNoBadge,

  SectionTitle,

} from "@/components/is-emri/is-emri-form-ui";

import { BRAND } from "@/lib/brand";

import { generateWorkOrderNo } from "@/lib/data/map-work-order";

import {

  calcGenelToplam,

  calcIscilikToplam,

  calcParcaToplam,

  calcServisSatinAlmaToplam,

} from "@/lib/is-emri/calculations";
import {
  ensureMinimumFormLines,
  mergeIscilikSatirlari,
  mergeParcaSatirlari,
} from "@/lib/is-emri/merge-form-lines";

import { initialIsEmriState, type IsEmriFormState } from "@/types/is-emri";
import type { AracDurumu } from "@/types/vehicle-status";

import type { WorkOrderImage } from "@/types/work-order-image";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { IS_EMRI_TIPLERI } from "@/types/work-order-payment";

import "./is-emri-print.css";



export interface IsEmriFormProps {

  mode?: "create" | "view" | "edit";

  initialForm?: IsEmriFormState;

  workOrderNo?: string;

  workOrderId?: string;

  autoPrint?: boolean;

  printRef?: RefObject<HTMLElement | null>;

  printImages?: WorkOrderImage[];

  onSave?: (form: IsEmriFormState) => void;

  /** Detay sayfasında araç durumu seçilince anında kaydet */
  onVehicleStatusPersist?: (status: AracDurumu) => Promise<boolean>;

  saving?: boolean;

}



export function IsEmriForm({

  mode = "create",

  initialForm,

  workOrderNo,

  autoPrint = false,

  printRef,

  printImages = [],

  onSave,

  workOrderId,

  onVehicleStatusPersist,

  saving = false,

}: IsEmriFormProps) {

  const readOnly = mode === "view";

  const [form, setForm] = useState<IsEmriFormState>(

    () => initialForm ?? initialIsEmriState()

  );

  const [vehicleStatusSaving, setVehicleStatusSaving] = useState(false);
  const [printPortalReady, setPrintPortalReady] = useState(false);

  useEffect(() => {
    setPrintPortalReady(true);
  }, []);

  useEffect(() => {
    if (initialForm) setForm(initialForm);
  }, [initialForm]);

  const [draftNo] = useState(() => generateWorkOrderNo());

  const isEmriNo = workOrderNo ?? draftNo;

  const assignPrintDocRef = useCallback(
    (node: HTMLElement | null) => {
      if (printRef) {
        (printRef as { current: HTMLElement | null }).current = node;
      }
    },
    [printRef]
  );



  useEffect(() => {

    if (autoPrint) {

      const t = window.setTimeout(() => window.print(), 400);

      return () => window.clearTimeout(t);

    }

  }, [autoPrint]);



  const parcaToplam = useMemo(

    () => calcParcaToplam(form.parcalar),

    [form.parcalar]

  );

  const iscilikToplam = useMemo(

    () => calcIscilikToplam(form.iscilikSatirlari),

    [form.iscilikSatirlari]

  );

  const servisSatinAlmaToplam = useMemo(

    () => calcServisSatinAlmaToplam(form.parcalar),

    [form.parcalar]

  );

  const genelToplam = useMemo(

    () => calcGenelToplam(form.parcalar, form.iscilikSatirlari),

    [form.parcalar, form.iscilikSatirlari]

  );



  const patch = useCallback(

    <K extends keyof IsEmriFormState>(key: K, value: IsEmriFormState[K]) => {

      setForm((prev) => ({ ...prev, [key]: value }));

    },

    []

  );

  const handleQuickAppend = useCallback(
    (payload: HizliParcaIscilikAppendPayload) => {
      setForm((prev) => {
        let parcalar = prev.parcalar;
        let iscilikSatirlari = prev.iscilikSatirlari;

        if (payload.parcalar?.length) {
          parcalar = mergeParcaSatirlari(parcalar, payload.parcalar);
        }
        if (payload.iscilik?.length) {
          iscilikSatirlari = mergeIscilikSatirlari(
            iscilikSatirlari,
            payload.iscilik
          );
        }

        return {
          ...prev,
          ...ensureMinimumFormLines(parcalar, iscilikSatirlari),
        };
      });
    },
    []
  );



  const ip = (editable: boolean) => inputPropsForMode(editable, readOnly);



  const handlePrint = () => window.print();



  const handleSave = () => {

    onSave?.(form);

  };



  const resetForm = () => {

    setForm(initialIsEmriState());

  };



  const formatTarih = (iso: string) => {

    if (!iso) return "—";

    try {

      return new Intl.DateTimeFormat("tr-TR", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric",

      }).format(new Date(iso + "T12:00:00"));

    } catch {

      return iso;

    }

  };



  const printDocument = (
    <IsEmriPrintDocument
      ref={assignPrintDocRef}
      form={form}
      isEmriNo={isEmriNo}
      parcaToplam={parcaToplam}
      servisSatinAlmaToplam={servisSatinAlmaToplam}
      iscilikToplam={iscilikToplam}
      genelToplam={genelToplam}
      printImages={printImages}
    />
  );

  return (

    <div className={cn(!readOnly && "mx-auto max-w-4xl")}>

      {printPortalReady ? createPortal(printDocument, document.body) : null}



      {!readOnly ? (

        <div className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-ink-muted">

            {mode === "edit"
              ? "Değişiklikleri kaydedin; ekip push bildirimi alır."
              : "Formu doldurun; yazdırma ve PDF kurumsal iş emri formatında çıkar."}

          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">

            <Button type="button" variant="secondary" onClick={resetForm}>

              Formu temizle

            </Button>

            <Button type="button" variant="secondary" onClick={handlePrint}>

              Yazdır

            </Button>

            <Button

              type="button"

              className="col-span-2 sm:col-span-1"

              onClick={handleSave}

              disabled={saving}

            >

              {saving ? "Kaydediliyor…" : "Kaydet"}

            </Button>

          </div>

        </div>

      ) : null}



      <article className="is-emri-edit-layer rounded-xl border border-border bg-surface shadow-sm">

        <header className="border-b border-border px-4 py-4 sm:px-6">

          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted dark:text-zinc-400">

            {BRAND.companyName}

          </p>

          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">

            <h1 className="text-xl font-bold text-ink dark:text-zinc-50">
              İş emri düzenleme
            </h1>

            <IsEmriNoBadge workOrderNo={isEmriNo} />

          </div>

          <p className="mt-1 text-xs text-ink-muted dark:text-zinc-400">

            Giriş: {formatTarih(form.serviseGirisTarihi)}

          </p>

          <div className="mt-3 max-w-sm">
            <Select
              label="İş emri tipi"
              options={IS_EMRI_TIPLERI}
              value={form.isEmriTipi}
              onChange={(e) =>
                patch(
                  "isEmriTipi",
                  e.target.value as IsEmriFormState["isEmriTipi"]
                )
              }
              disabled={readOnly}
            />
          </div>

        </header>



        <div className="space-y-6 p-4 sm:p-6">

          <section>

            <SectionTitle no="1">Müşteri Bilgileri</SectionTitle>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="sm:col-span-2">

                <label className={labelClass()}>Ruhsat sahibinin adı soyadı</label>

                <input

                  className={fieldClass()}

                  value={form.ruhsatSahibi}

                  onChange={(e) => patch("ruhsatSahibi", e.target.value)}

                  placeholder="Ad Soyad"

                  {...ip(true)}

                />

              </div>

              <div>

                <label className={labelClass()}>Telefon</label>

                <input

                  className={fieldClass()}

                  type="tel"

                  value={form.telefon}

                  onChange={(e) => patch("telefon", e.target.value)}

                  placeholder="05XX XXX XX XX"

                  {...ip(true)}

                />

              </div>

              <div>

                <label className={labelClass()}>Plaka</label>

                <input

                  className={fieldClass()}

                  value={form.plaka}

                  onChange={(e) => patch("plaka", e.target.value.toUpperCase())}

                  placeholder="34 ABC 123"

                  {...ip(true)}

                />

              </div>

            </div>

          </section>



          <section>

            <SectionTitle no="2">Araç Bilgileri</SectionTitle>

            <div className="mb-4 rounded-xl border border-border bg-surface-muted/40 p-4">

              <label className={labelClass()}>Araç durumu</label>

              <VehicleStatusSelect

                value={form.aracDurumu}

                onChange={(aracDurumu) => {
                  patch("aracDurumu", aracDurumu);
                  if (workOrderId && onVehicleStatusPersist) {
                    setVehicleStatusSaving(true);
                    void onVehicleStatusPersist(aracDurumu).finally(() =>
                      setVehicleStatusSaving(false)
                    );
                  }
                }}

                disabled={readOnly || vehicleStatusSaving}

              />

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>

                <label className={labelClass()}>Marka</label>

                <input

                  className={fieldClass()}

                  value={form.marka}

                  onChange={(e) => patch("marka", e.target.value)}

                  {...ip(true)}

                />

              </div>

              <div>

                <label className={labelClass()}>Model</label>

                <input

                  className={fieldClass()}

                  value={form.model}

                  onChange={(e) => patch("model", e.target.value)}

                  {...ip(true)}

                />

              </div>

              <div>

                <label className={labelClass()}>KM</label>

                <input

                  className={fieldClass()}

                  inputMode="numeric"

                  value={form.km}

                  onChange={(e) => patch("km", e.target.value)}

                  placeholder="125.000"

                  {...ip(true)}

                />

              </div>

              <div>

                <label className={labelClass()}>Servise giriş tarihi</label>

                <input

                  className={fieldClass()}

                  type="date"

                  value={form.serviseGirisTarihi}

                  onChange={(e) => patch("serviseGirisTarihi", e.target.value)}

                  {...ip(true)}

                />

              </div>

            </div>

          </section>



          <section>

            <SectionTitle no="3">Ekspertiz</SectionTitle>

            <div className="space-y-4">

              <EkspertizChecklist

                items={form.ekspertizChecklist}

                readOnly={readOnly}

                onChange={(ekspertizChecklist) =>

                  patch("ekspertizChecklist", ekspertizChecklist)

                }

                inputProps={ip}

              />

              <div>

                <label className={labelClass()}>Ekspertiz notları</label>

                <textarea

                  className={cn(fieldClass(), "min-h-[72px]")}

                  rows={2}

                  value={form.ekspertizAlani}

                  onChange={(e) => patch("ekspertizAlani", e.target.value)}

                  placeholder="Ek tespit ve açıklamalar…"

                  {...ip(true)}

                />

              </div>

            </div>

          </section>



          <section>

            <SectionTitle no="4">İş Emri</SectionTitle>

            <div className="space-y-6">

              <div>

                <label className={labelClass()}>Yapılacak işlemler</label>

                <textarea

                  className={cn(fieldClass(), "min-h-[100px]")}

                  rows={4}

                  value={form.yapilacakIslemler}

                  onChange={(e) => patch("yapilacakIslemler", e.target.value)}

                  placeholder="Onarım, boya, mekanik işlemler…"

                  {...ip(true)}

                />

              </div>

              <HizliParcaIscilikGiris
                readOnly={readOnly}
                onAppend={handleQuickAppend}
              />

              <ParcaListesi

                parcalar={form.parcalar}

                readOnly={readOnly}

                onChange={(parcalar) => patch("parcalar", parcalar)}

                inputProps={ip}

              />



              <IscilikListesi

                satirlar={form.iscilikSatirlari}

                readOnly={readOnly}

                onChange={(iscilikSatirlari) =>

                  patch("iscilikSatirlari", iscilikSatirlari)

                }

                inputProps={ip}

              />



              <IsEmriToplamKartlari

                parcaToplam={parcaToplam}

                servisSatinAlmaToplam={servisSatinAlmaToplam}

                iscilikToplam={iscilikToplam}

                genelToplam={genelToplam}

              />

              {!readOnly ? (
                <IsEmriOdemeKarti
                  form={form}
                  genelToplam={genelToplam}
                  onPatch={patch}
                />
              ) : null}

            </div>

          </section>



          <section className="is-emri-signatures">

            <SectionTitle no="5">İmzalar (ıslak imza)</SectionTitle>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              <WetSignatureBlock

                title="Müşteri İmzası"

                nameLabel="Ad soyad (okunaklı)"

                name={form.musteriImza}

                onNameChange={(v) => patch("musteriImza", v)}

                readOnly={readOnly}

              />

              <WetSignatureBlock

                title="Servis Yetkilisi"

                nameLabel="Ad soyad / unvan"

                name={form.servisYetkilisi}

                onNameChange={(v) => patch("servisYetkilisi", v)}

                readOnly={readOnly}

              />

            </div>

            <p className="mt-4 text-center text-xs text-ink-faint">

              Yazdırma ve PDF çıktısında imza kutuları boş ve çizgili olarak yer

              alır; müşteri formu imzaladığında geçerlidir.

            </p>

          </section>

        </div>

      </article>

    </div>

  );

}

