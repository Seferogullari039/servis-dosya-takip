import type { AracDurumu } from "@/types/vehicle-status";
import type { WorkOrderImageStats } from "@/types/work-order-image";

export interface AracDashboardStats {
  bugunGelen: number;
  islemde: number;
  parcaBekleyen: number;
  hazir: number;
  teslimEdilen: number;
  toplamAktif: number;
}

export interface GunlukIsEmriNokta {
  tarih: string;
  label: string;
  adet: number;
}

export interface DurumDagilimNokta {
  name: AracDurumu;
  value: number;
}

export interface CanliIsEmriSatir {
  id: string;
  plaka: string;
  musteriAdi: string;
  aracDurumu: AracDurumu;
  toplamTutar: number;
  isEmriNo: string;
}

export interface TedarikDashboardStats {
  bekleyen: number;
  yolda: number;
  gelen: number;
  stoktaYok: number;
  servisSatin: number;
}

export interface AracDashboardData {
  stats: AracDashboardStats;
  tedarik: TedarikDashboardStats;
  gorsel: WorkOrderImageStats;
  gunlukIsEmirleri: GunlukIsEmriNokta[];
  durumDagilimi: DurumDagilimNokta[];
  canliPanel: CanliIsEmriSatir[];
}
