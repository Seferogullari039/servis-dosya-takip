import {
  calcGenelToplam,
  calcIscilikToplam,
  calcParcaToplam,
  calcParcaSatirToplam,
  syncParcaToplamFiyat,
} from "@/lib/is-emri/calculations";
import {
  createDefaultEkspertizChecklist,
  createEmptyIscilikSatir,
  createEmptyParcaSatir,
  DEFAULT_EKSPERTIZ_CHECKLIST,
  type EkspertizCheckItem,
  type IsEmriFormState,
  type IsEmriKayit,
  type IsEmriOzet,
  type IscilikSatir,
  type ParcaSatir,
} from "@/types/is-emri";
import {
  isTedarikDurumu,
  migrateLegacyParcaDurumu,
  parseTedarikDurumu,
} from "@/types/tedarik";
import { parseAracDurumu } from "@/types/vehicle-status";
import type { WorkOrderInsert, WorkOrderRow } from "@/types/supabase";

export interface WorkOrderPartStored {
  id: string;
  parcaAdi: string;
  adet: string;
  birimFiyat?: string;
  unit_price?: string;
  total_price?: string;
  toplamFiyat?: string;
  procurement_status?: string;
  shipment_date?: string;
  arrival_date?: string;
  purchased_by_service?: boolean;
  procurement_note?: string;
  durum?: string;
  geldi?: boolean;
  arrived?: boolean;
}

export interface WorkOrderLaborStored {
  id: string;
  aciklama: string;
  tutar: string | number;
}

export function generateWorkOrderNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `IE-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function mapPartsToStored(parcalar: ParcaSatir[]): WorkOrderPartStored[] {
  return parcalar.map((row) => {
    const synced = syncParcaToplamFiyat(row);
    return {
      id: synced.id,
      parcaAdi: synced.parcaAdi.trim(),
      adet: synced.adet.trim() || "1",
      birimFiyat: synced.birimFiyat.trim(),
      unit_price: synced.birimFiyat.trim(),
      total_price: synced.toplamFiyat.trim() || String(calcParcaSatirToplam(synced)),
      procurement_status: synced.tedarikDurumu,
      shipment_date: synced.tedarikTarihi || undefined,
      arrival_date: synced.geldiTarihi || undefined,
      purchased_by_service: synced.servisSatinAldi,
      procurement_note: synced.tedarikNotu.trim() || undefined,
    };
  });
}

export function parseStoredParts(raw: unknown): ParcaSatir[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item) => {
    const row = item as Partial<WorkOrderPartStored>;
    const geldi = Boolean(row.geldi ?? row.arrived);
    const legacyStatus = row.procurement_status ?? row.durum;
    const tedarikDurumu = isTedarikDurumu(legacyStatus)
      ? legacyStatus
      : migrateLegacyParcaDurumu(legacyStatus, geldi);

    const birimFiyat = String(
      row.birimFiyat ?? row.unit_price ?? ""
    );
    const parsed: ParcaSatir = {
      id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
      parcaAdi: String(row.parcaAdi ?? ""),
      adet: String(row.adet ?? "1"),
      birimFiyat,
      toplamFiyat: String(row.toplamFiyat ?? row.total_price ?? ""),
      tedarikDurumu: parseTedarikDurumu(tedarikDurumu),
      tedarikTarihi: String(row.shipment_date ?? ""),
      geldiTarihi: String(row.arrival_date ?? ""),
      servisSatinAldi: Boolean(
        row.purchased_by_service ?? (tedarikDurumu === "Servis Satın Aldı")
      ),
      tedarikNotu: String(row.procurement_note ?? ""),
    };
    return syncParcaToplamFiyat(parsed);
  });
}

function mapChecklistToStored(items: EkspertizCheckItem[]) {
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    checked: item.checked,
    note: item.note.trim(),
  }));
}

function parseStoredChecklist(raw: unknown): EkspertizCheckItem[] {
  const defaults = createDefaultEkspertizChecklist();
  if (!Array.isArray(raw) || raw.length === 0) return defaults;

  const byKey = new Map<string, EkspertizCheckItem>();
  for (const item of raw) {
    const row = item as Partial<EkspertizCheckItem>;
    if (typeof row.key !== "string") continue;
    byKey.set(row.key, {
      key: row.key,
      label: String(row.label ?? row.key),
      checked: Boolean(row.checked),
      note: String(row.note ?? ""),
    });
  }

  return DEFAULT_EKSPERTIZ_CHECKLIST.map((def) => {
    const found = byKey.get(def.key);
    return (
      found ?? {
        ...def,
        checked: false,
        note: "",
      }
    );
  });
}

function mapLaborToStored(satirlar: IscilikSatir[]): WorkOrderLaborStored[] {
  return satirlar.map((row) => ({
    id: row.id,
    aciklama: row.aciklama.trim(),
    tutar: row.tutar.trim(),
  }));
}

function parseStoredLabor(raw: unknown, laborTotal: number): IscilikSatir[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item) => {
      const row = item as Partial<WorkOrderLaborStored>;
      return {
        id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
        aciklama: String(row.aciklama ?? ""),
        tutar: String(row.tutar ?? ""),
      };
    });
  }
  if (laborTotal > 0) {
    return [
      {
        id: crypto.randomUUID(),
        aciklama: "İşçilik",
        tutar: String(laborTotal),
      },
    ];
  }
  return [createEmptyIscilikSatir()];
}

export function mapFormToWorkOrderInsert(
  form: IsEmriFormState,
  workOrderNo: string
): WorkOrderInsert {
  const partsTotal = calcParcaToplam(form.parcalar);
  const laborTotal = calcIscilikToplam(form.iscilikSatirlari);
  const grandTotal = partsTotal + laborTotal;

  return {
    work_order_no: workOrderNo,
    customer_name: form.ruhsatSahibi.trim(),
    phone: form.telefon.trim() || null,
    plate: form.plaka.trim(),
    brand: form.marka.trim() || null,
    model: form.model.trim() || null,
    km: form.km.trim() || null,
    entry_date: form.serviseGirisTarihi || new Date().toISOString().slice(0, 10),
    expertise_notes: form.ekspertizAlani.trim() || null,
    expertise_checklist: mapChecklistToStored(
      form.ekspertizChecklist
    ) as unknown as WorkOrderInsert["expertise_checklist"],
    work_description: form.yapilacakIslemler.trim() || null,
    labor_total: laborTotal,
    labor_items: mapLaborToStored(
      form.iscilikSatirlari
    ) as unknown as WorkOrderInsert["labor_items"],
    parts_total: partsTotal,
    grand_total: grandTotal,
    parts: mapPartsToStored(form.parcalar) as unknown as WorkOrderInsert["parts"],
    customer_signature: null,
    vehicle_status: form.aracDurumu,
  };
}

export function mapRowToIsEmriKayit(row: WorkOrderRow): IsEmriKayit {
  const parcalar = parseStoredParts(row.parts);
  const iscilikSatirlari = parseStoredLabor(
    row.labor_items,
    Number(row.labor_total ?? 0)
  );
  const parcaToplam = Number(row.parts_total ?? calcParcaToplam(parcalar));
  const iscilikToplam = Number(
    row.labor_total ?? calcIscilikToplam(iscilikSatirlari)
  );

  return {
    id: row.id,
    isEmriNo: row.work_order_no,
    ruhsatSahibi: row.customer_name,
    telefon: row.phone ?? "",
    plaka: row.plate,
    marka: row.brand ?? "",
    model: row.model ?? "",
    km: row.km ?? "",
    serviseGirisTarihi: row.entry_date,
    ekspertizAlani: row.expertise_notes ?? "",
    ekspertizChecklist: parseStoredChecklist(row.expertise_checklist),
    yapilacakIslemler: row.work_description ?? "",
    parcalar: parcalar.length > 0 ? parcalar : [createEmptyParcaSatir()],
    iscilikSatirlari,
    musteriImza: "",
    servisYetkilisi: "",
    customerSignature: row.customer_signature ?? null,
    aracDurumu: parseAracDurumu(row.vehicle_status),
    parcaToplam,
    iscilikToplam,
    toplamTutar: Number(row.grand_total ?? parcaToplam + iscilikToplam),
    createdAt: row.created_at,
  };
}

export function mapRowToIsEmriOzet(row: WorkOrderRow): IsEmriOzet {
  return {
    id: row.id,
    isEmriNo: row.work_order_no,
    plaka: row.plate,
    musteriAdi: row.customer_name,
    tarih: row.entry_date,
    toplamTutar: Number(row.grand_total ?? 0),
    aracDurumu: parseAracDurumu(row.vehicle_status),
    createdAt: row.created_at,
  };
}

export function isEmriKayitToFormState(kayit: IsEmriKayit): IsEmriFormState {
  return {
    ruhsatSahibi: kayit.ruhsatSahibi,
    telefon: kayit.telefon,
    plaka: kayit.plaka,
    marka: kayit.marka,
    model: kayit.model,
    km: kayit.km,
    serviseGirisTarihi: kayit.serviseGirisTarihi,
    ekspertizAlani: kayit.ekspertizAlani,
    ekspertizChecklist: kayit.ekspertizChecklist,
    yapilacakIslemler: kayit.yapilacakIslemler,
    parcalar: kayit.parcalar,
    iscilikSatirlari: kayit.iscilikSatirlari,
    musteriImza: kayit.musteriImza,
    servisYetkilisi: kayit.servisYetkilisi,
    customerSignature: kayit.customerSignature,
    aracDurumu: kayit.aracDurumu,
  };
}

export { calcGenelToplam };
