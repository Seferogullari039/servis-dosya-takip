import { parseTutar, parseTutarOptional } from "@/lib/utils/para";
import type { DosyaDurumu, OdemeDurumu, ServisDosyasi } from "@/types/servis-dosya";
import type { ServisDosyasiRow } from "@/types/supabase";

export function mapRowToServisDosya(row: ServisDosyasiRow): ServisDosyasi {
  return {
    id: row.id,
    dosyaNo: row.dosya_no,
    plaka: row.plaka,
    musteriAdi: row.musteri_adi,
    telefon: row.telefon ?? "",
    aracMarkaModel: row.arac_marka_model ?? "",
    eksperAdi: row.eksper_adi ?? "",
    durum: row.durum as DosyaDurumu,
    odemeDurumu: row.odeme_durumu as OdemeDurumu,
    dosyaTutari: parseTutarOptional(row.dosya_tutari),
    odenenTutar: parseTutar(row.odenen_tutar),
    notlar: row.notlar ?? "",
    olusturulmaTarihi: row.created_at,
  };
}
