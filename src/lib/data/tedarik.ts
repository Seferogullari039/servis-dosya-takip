import { parseStoredParts } from "@/lib/data/map-work-order";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import { countTedarikFromParts } from "@/lib/tedarik/group";
import type { TedarikListFilters, TedarikParcaKayit } from "@/types/tedarik";
import type { WorkOrderRow } from "@/types/supabase";

function buildSearchPattern(arama: string): string {
  const cleaned = arama.trim().replace(/\s+/g, "%");
  return `%${cleaned}%`;
}

function flattenWorkOrderParts(row: WorkOrderRow): TedarikParcaKayit[] {
  const parcalar = parseStoredParts(row.parts);
  return parcalar
    .filter((p) => p.parcaAdi.trim())
    .map((p) => ({
      partId: p.id,
      workOrderId: row.id,
      isEmriNo: row.work_order_no,
      plaka: row.plate,
      musteriAdi: row.customer_name,
      entryDate: row.entry_date,
      parcaAdi: p.parcaAdi,
      adet: p.adet,
      birimFiyat: parseTutarFromPart(p.birimFiyat),
      toplamFiyat: calcParcaSatirToplam(p),
      tedarikDurumu: p.tedarikDurumu,
      tedarikTarihi: p.tedarikTarihi,
      geldiTarihi: p.geldiTarihi,
      servisSatinAldi: p.servisSatinAldi,
      tedarikNotu: p.tedarikNotu,
    }));
}

function parseTutarFromPart(raw: string): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function matchesFilters(
  row: TedarikParcaKayit,
  filters?: TedarikListFilters
): boolean {
  if (!filters) return true;
  if (filters.tedarikDurumu && row.tedarikDurumu !== filters.tedarikDurumu) {
    return false;
  }
  if (filters.baslangic && row.entryDate < filters.baslangic) return false;
  if (filters.bitis && row.entryDate > filters.bitis) return false;
  return true;
}

export async function listeleTedarikParcalari(
  filters?: TedarikListFilters
): Promise<DataResult<TedarikParcaKayit[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    const term = filters?.arama?.trim();
    if (term) {
      const pattern = buildSearchPattern(term);
      query = query.or(
        `plate.ilike."${pattern}",customer_name.ilike."${pattern}",work_order_no.ilike."${pattern}"`
      );
    }

    if (filters?.baslangic) {
      query = query.gte("entry_date", filters.baslangic);
    }
    if (filters?.bitis) {
      query = query.lte("entry_date", filters.bitis);
    }

    const { data, error } = await query;
    if (error) return fail(error.message);

    const flat = (data ?? []).flatMap((row) =>
      flattenWorkOrderParts(row as WorkOrderRow)
    );

    return ok(flat.filter((r) => matchesFilters(r, filters)));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Tedarik listesi yüklenemedi.");
  }
}

export { countTedarikFromParts, groupTedarikByPanel } from "@/lib/tedarik/group";
