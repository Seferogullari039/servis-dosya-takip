import { BRAND } from "@/lib/brand";
import { formatPara } from "@/lib/utils/para";
import { linesToCsv } from "@/lib/export/csv";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import {
  birimFiyatAmount,
  buildParcaIscilikExportPayload,
  buildParcaIscilikExportPayloadFromKayit,
  formatExportDateTime,
  formatExportDosyaNo,
  formatExportSigortaSirketi,
  geldiMiLabel,
  iscilikTutarAmount,
  parcaIscilikExportBasename,
  type ParcaIscilikExportMeta,
  type ParcaIscilikExportPayload,
} from "@/lib/is-emri/parca-iscilik-export-data";

export type {
  ParcaIscilikExportMeta as ParcaIscilikCsvMeta,
  ParcaIscilikExportPayload as BuildParcaIscilikCsvInput,
};

function emptyRow(): unknown[] {
  return [];
}

function metaRow(label: string, value: string): unknown[] {
  return [label, value];
}

export function buildParcaIscilikCsv(payload: ParcaIscilikExportPayload): string {
  const { meta } = payload;

  const lines: unknown[][] = [
    [BRAND.companyName],
    ["Parça & İşçilik Listesi"],
    emptyRow(),
    metaRow("İş Emri No", meta.isEmriNo),
    metaRow("Dosya No", formatExportDosyaNo(meta.dosyaNo)),
    metaRow("Tarih", formatExportDateTime(meta.tarih)),
    metaRow("Plaka", meta.plaka || "—"),
    metaRow("Müşteri", meta.musteri || "—"),
    metaRow("Telefon", meta.telefon || "—"),
    metaRow("Araç", meta.arac || "—"),
    metaRow("Sigorta Şirketi", formatExportSigortaSirketi(meta.sigortaSirketi)),
    emptyRow(),
    ["PARÇALAR"],
    [
      "Parça Adı",
      "Adet",
      "Birim Fiyat",
      "Toplam",
      "Tedarik Durumu",
      "Geldi Mi",
      "Not",
    ],
    ...payload.parcalar.map((row) => [
      row.parcaAdi.trim(),
      row.adet.trim() || "1",
      formatPara(birimFiyatAmount(row)),
      formatPara(calcParcaSatirToplam(row)),
      row.tedarikDurumu,
      geldiMiLabel(row),
      row.tedarikNotu.trim(),
    ]),
    emptyRow(),
    ["İŞÇİLİKLER"],
    ["Açıklama", "Tutar"],
    ...payload.iscilikSatirlari.map((row) => [
      row.aciklama.trim(),
      formatPara(iscilikTutarAmount(row)),
    ]),
    emptyRow(),
    ["TOPLAMLAR"],
    metaRow("Parça Toplamı", formatPara(payload.parcaToplam)),
    metaRow("İşçilik Toplamı", formatPara(payload.iscilikToplam)),
    metaRow("Genel Toplam", formatPara(payload.genelToplam)),
  ];

  return linesToCsv(lines);
}

/** IE-{is_emri_no}-parca-iscilik.csv */
export function parcaIscilikCsvFilename(workOrderNo: string): string {
  return `${parcaIscilikExportBasename(workOrderNo)}-parca-iscilik.csv`;
}

export function downloadParcaIscilikCsv(csv: string, workOrderNo: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = parcaIscilikCsvFilename(workOrderNo);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildParcaIscilikCsvFromKayit(
  kayit: Parameters<typeof buildParcaIscilikExportPayloadFromKayit>[0],
  dosyaMeta?: Parameters<typeof buildParcaIscilikExportPayloadFromKayit>[1]
): string {
  return buildParcaIscilikCsv(
    buildParcaIscilikExportPayloadFromKayit(kayit, dosyaMeta)
  );
}

export { buildParcaIscilikExportPayload, buildParcaIscilikExportPayloadFromKayit };
