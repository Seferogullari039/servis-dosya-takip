import { BRAND } from "@/lib/brand";
import type { ParcaIscilikExportPayload } from "@/lib/is-emri/parca-iscilik-export-data";
import {
  birimFiyatAmount,
  formatExportDateTime,
  formatExportDosyaNo,
  formatExportSigortaSirketi,
  geldiMiLabel,
  iscilikTutarAmount,
  parcaIscilikExportBasename,
  tedarikDurumuFillColor,
} from "@/lib/is-emri/parca-iscilik-export-data";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import type { Border, Fill, Worksheet } from "exceljs";

const COL_COUNT = 7;
const TL_NUM_FMT = '#,##0.00" ₺"';

const COLORS = {
  brand: "FF0F4C81",
  brandSoft: "FFE8F2FA",
  section: "FFDCEAF4",
  total: "FFF4F8FB",
  border: "FFD0D7DE",
  label: "FF5A6570",
  white: "FFFFFFFF",
};

const THIN_BORDER: Partial<Border> = {
  style: "thin",
  color: { argb: COLORS.border },
};

function allBorders() {
  return {
    top: THIN_BORDER,
    left: THIN_BORDER,
    bottom: THIN_BORDER,
    right: THIN_BORDER,
  };
}

function solidFill(argb: string): Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function mergeRow(ws: Worksheet, row: number) {
  ws.mergeCells(row, 1, row, COL_COUNT);
}

function styleCell(
  ws: Worksheet,
  row: number,
  col: number,
  opts: {
    bold?: boolean;
    size?: number;
    color?: string;
    fill?: string;
    align?: "left" | "center" | "right";
    border?: boolean;
    numFmt?: string;
  } = {}
) {
  const cell = ws.getCell(row, col);
  cell.font = {
    bold: opts.bold,
    size: opts.size ?? 11,
    color: opts.color ? { argb: opts.color } : undefined,
    name: "Calibri",
  };
  if (opts.fill) cell.fill = solidFill(opts.fill);
  if (opts.align) cell.alignment = { vertical: "middle", horizontal: opts.align };
  if (opts.border) cell.border = allBorders();
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  return cell;
}

function styleRowRange(
  ws: Worksheet,
  row: number,
  fromCol: number,
  toCol: number,
  opts: Parameters<typeof styleCell>[3]
) {
  for (let col = fromCol; col <= toCol; col++) {
    styleCell(ws, row, col, opts);
  }
}

function setMoney(cell: ReturnType<Worksheet["getCell"]>, value: number) {
  cell.value = value;
  cell.numFmt = TL_NUM_FMT;
  cell.alignment = { vertical: "middle", horizontal: "right" };
}

export function parcaIscilikXlsxFilename(workOrderNo: string): string {
  return `${parcaIscilikExportBasename(workOrderNo)}-parca-iscilik.xlsx`;
}

export async function buildParcaIscilikXlsxBuffer(
  payload: ParcaIscilikExportPayload
): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = BRAND.companyName;
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Parça & İşçilik", {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.45,
        right: 0.45,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  ws.columns = [
    { width: 24 },
    { width: 10 },
    { width: 14 },
    { width: 14 },
    { width: 20 },
    { width: 10 },
    { width: 28 },
  ];

  let row = 1;
  const { meta } = payload;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 16,
    color: COLORS.white,
    fill: COLORS.brand,
    align: "center",
  }).value = BRAND.companyName;
  ws.getRow(row).height = 28;
  row++;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 12,
    color: COLORS.brand,
    fill: COLORS.brandSoft,
    align: "center",
  }).value = "Parça & İşçilik Listesi";
  ws.getRow(row).height = 22;
  row++;

  row++;

  const metaRows: [string, string][] = [
    ["İş Emri No", meta.isEmriNo],
    ["Dosya No", formatExportDosyaNo(meta.dosyaNo)],
    ["Tarih", formatExportDateTime(meta.tarih)],
    ["Plaka", meta.plaka || "—"],
    ["Müşteri", meta.musteri || "—"],
    ["Telefon", meta.telefon || "—"],
    ["Araç", meta.arac || "—"],
    ["Sigorta Şirketi", formatExportSigortaSirketi(meta.sigortaSirketi)],
  ];

  for (const [label, value] of metaRows) {
    styleCell(ws, row, 1, { bold: true, color: COLORS.label, fill: COLORS.total });
    styleCell(ws, row, 2, { border: true });
    ws.mergeCells(row, 2, row, COL_COUNT);
    ws.getCell(row, 1).value = label;
    ws.getCell(row, 2).value = value;
    ws.getCell(row, 2).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    ws.getCell(row, 2).border = allBorders();
    row++;
  }

  row++;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 12,
    color: COLORS.white,
    fill: COLORS.brand,
    align: "left",
  }).value = "PARÇALAR";
  ws.getRow(row).height = 20;
  row++;

  const parcaHeaders = [
    "Parça Adı",
    "Adet",
    "Birim Fiyat",
    "Toplam",
    "Tedarik Durumu",
    "Geldi Mi",
    "Not",
  ];
  parcaHeaders.forEach((header, index) => {
    styleCell(ws, row, index + 1, {
      bold: true,
      fill: COLORS.section,
      border: true,
      align: index >= 1 && index <= 3 ? "center" : "left",
    }).value = header;
  });
  ws.getRow(row).height = 20;
  row++;

  for (const part of payload.parcalar) {
    const values: (string | number)[] = [
      part.parcaAdi.trim(),
      Number.parseFloat(part.adet.replace(",", ".")) || 1,
      birimFiyatAmount(part),
      calcParcaSatirToplam(part),
      part.tedarikDurumu,
      geldiMiLabel(part),
      part.tedarikNotu.trim(),
    ];
    values.forEach((value, index) => {
      const cell = styleCell(ws, row, index + 1, { border: true });
      if (index === 1) {
        cell.value = value;
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (index === 2 || index === 3) {
        setMoney(cell, value as number);
      } else if (index === 4) {
        const durum = part.tedarikDurumu;
        cell.value = durum;
        const fill = tedarikDurumuFillColor(durum);
        cell.alignment = { vertical: "middle", horizontal: "left" };
        if (fill) cell.fill = solidFill(fill);
      } else {
        cell.value = value;
        cell.alignment = {
          vertical: "middle",
          horizontal: index === 0 || index >= 5 ? "left" : "center",
          wrapText: index === 6,
        };
      }
    });
    row++;
  }

  row++;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 12,
    color: COLORS.white,
    fill: COLORS.brand,
    align: "left",
  }).value = "İŞÇİLİKLER";
  ws.getRow(row).height = 20;
  row++;

  styleCell(ws, row, 1, { bold: true, fill: COLORS.section, border: true }).value =
    "Açıklama";
  styleCell(ws, row, 2, { bold: true, fill: COLORS.section, border: true }).value =
    "Tutar";
  ws.mergeCells(row, 2, row, COL_COUNT);
  styleRowRange(ws, row, 2, COL_COUNT, { bold: true, fill: COLORS.section, border: true });
  row++;

  for (const labor of payload.iscilikSatirlari) {
    styleCell(ws, row, 1, { border: true }).value = labor.aciklama.trim();
    ws.getCell(row, 1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    const tutarCell = styleCell(ws, row, 2, { border: true });
    setMoney(tutarCell, iscilikTutarAmount(labor));
    ws.mergeCells(row, 2, row, COL_COUNT);
    styleRowRange(ws, row, 2, COL_COUNT, { border: true });
    row++;
  }

  row++;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 12,
    color: COLORS.brand,
    fill: COLORS.total,
    align: "left",
  }).value = "TOPLAMLAR";
  ws.getRow(row).height = 20;
  row++;

  const totals: [string, number][] = [
    ["Parça Toplamı", payload.parcaToplam],
    ["İşçilik Toplamı", payload.iscilikToplam],
    ["Genel Toplam", payload.genelToplam],
  ];

  for (const [label, amount] of totals) {
    styleCell(ws, row, 1, {
      bold: true,
      fill: COLORS.total,
      border: true,
    }).value = label;
    const amountCell = styleCell(ws, row, 2, {
      bold: true,
      fill: COLORS.total,
      border: true,
    });
    setMoney(amountCell, amount);
    ws.mergeCells(row, 2, row, COL_COUNT);
    styleRowRange(ws, row, 2, COL_COUNT, {
      bold: true,
      fill: COLORS.total,
      border: true,
    });
    row++;
  }

  row++;

  mergeRow(ws, row);
  styleCell(ws, row, 1, {
    bold: true,
    size: 12,
    color: COLORS.white,
    fill: COLORS.brand,
    align: "left",
  }).value = "TEDARİK ÖZETİ";
  ws.getRow(row).height = 20;
  row++;

  const ozet = payload.tedarikOzeti;
  const ozetRows: [string, number][] = [
    ["Toplam Parça", ozet.toplamParca],
    ["Gelen Parça", ozet.gelenParca],
    ["Bekleyen Parça", ozet.bekleyenParca],
    ["Servisin Satın Aldığı Parça", ozet.servisSatinAldiParca],
    ["Sigortadan Beklenen Parça", ozet.sigortadanBeklenenParca],
  ];

  for (const [label, count] of ozetRows) {
    styleCell(ws, row, 1, {
      bold: true,
      fill: COLORS.section,
      border: true,
    }).value = label;
    const countCell = styleCell(ws, row, 2, {
      bold: true,
      fill: COLORS.section,
      border: true,
      align: "center",
    });
    countCell.value = count;
    ws.mergeCells(row, 2, row, COL_COUNT);
    styleRowRange(ws, row, 2, COL_COUNT, {
      bold: true,
      fill: COLORS.section,
      border: true,
      align: "center",
    });
    row++;
  }

  return workbook.xlsx.writeBuffer();
}

export async function downloadParcaIscilikXlsx(
  payload: ParcaIscilikExportPayload,
  workOrderNo: string
): Promise<void> {
  const buffer = await buildParcaIscilikXlsxBuffer(payload);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = parcaIscilikXlsxFilename(workOrderNo);
  anchor.click();
  URL.revokeObjectURL(url);
}
