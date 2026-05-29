import type { DosyaDurumu, OdemeDurumu, ServisDosyasi } from "@/types/servis-dosya";
import type { ServiceFileEvent } from "@/types/events";
import type { UserRole } from "@/lib/auth/types";

export type DashboardPeriod = "today" | "7" | "30";

export const DASHBOARD_PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Bugün" },
  { value: "7", label: "7 Gün" },
  { value: "30", label: "30 Gün" },
];

export interface OperasyonMetrikleri {
  toplamAktif: number;
  bugunAcilan: number;
  tedarikSurecinde: number;
  eksperBekleyen: number;
  onarimda: number;
  bugunKapanan: number;
}

export interface FinansMetrikleri {
  odemeBekleyen: number;
  kismiOdenen: number;
  tamamlananOdeme: number;
  /** Tüm dosyalarda tahsil edilen toplam (TL) */
  toplamTahsilat: number;
  /** Tanımlı dosya tutarlarının toplamı (TL) */
  toplamDosyaTutari: number;
  /** Kalan alacak: dosya tutarı − ödenen (TL) */
  bekleyenTutar: number;
  sonOdemeHareketleri: OdemeHareketi[];
}

export interface OdemeHareketi {
  id: string;
  serviceFileId: string;
  dosyaNo: string;
  plaka: string;
  title: string;
  description: string | null;
  userFullName: string;
  createdAt: string;
  yeniOdeme?: string;
}

export type GecikmeSeviyesi = "normal" | "risk" | "kritik";

export interface GecikenDosya {
  id: string;
  dosyaNo: string;
  plaka: string;
  mevcutDurum: DosyaDurumu;
  gunSayisi: number;
  seviye: GecikmeSeviyesi;
}

export interface PersonelAktivitesi {
  userId: string;
  fullName: string;
  role: UserRole;
  islemSayisi: number;
  sonIslemZamani: string | null;
}

export interface PersonelAktiviteOzeti {
  bugunIslemSayisi: number;
  kullanicilar: PersonelAktivitesi[];
}

export interface GrafikVerisi {
  durumDagilimi: { name: string; value: number }[];
  odemeDagilimi: { name: string; value: number }[];
  gunlukAcilanDosya: { tarih: string; adet: number }[];
}

/** PDF raporlama için serialize edilebilir tam paket */
export interface DashboardReportData {
  period: DashboardPeriod;
  periodLabel: string;
  generatedAt: string;
  operasyon: OperasyonMetrikleri;
  finans: FinansMetrikleri;
  gecikenDosyalar: GecikenDosya[];
  personel: PersonelAktiviteOzeti;
  sonAktiviteler: ServiceFileEvent[];
  grafikler: GrafikVerisi;
}

export interface OperasyonDashboardData {
  period: DashboardPeriod;
  /** Aggregation layer — today tasks ve list türevleri için */
  dosyalar: ServisDosyasi[];
  operasyon: OperasyonMetrikleri;
  finans: FinansMetrikleri;
  gecikenDosyalar: GecikenDosya[];
  personel: PersonelAktiviteOzeti;
  sonAktiviteler: ServiceFileEvent[];
  grafikler: GrafikVerisi;
  report: DashboardReportData;
}
